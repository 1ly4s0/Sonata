#!/usr/bin/env python3
"""
patch_elf_16k.py - Fix ELF load segment alignment from 4KB to 16KB for Android Play Store compliance.

Algorithm:
  For each PT_LOAD segment after the first, if (p_vaddr - p_offset) is not divisible by 16384,
  insert minimal padding in the file at the segment's start position so that the consistency
  constraint (p_vaddr % p_align == p_offset % p_align) is satisfied.
  Virtual addresses (p_vaddr) are NOT changed, so no relocations need updating.
  Only file offsets (p_offset) and p_align are modified.

Usage:
  patch_elf_16k.py <input_dir>          - patch all .so files in-place in directory tree
  patch_elf_16k.py <input.so> <out.so>  - patch single file
"""

import struct
import sys
import os

TARGET_ALIGN = 0x4000  # 16KB


def patch_elf_16kb(input_path, output_path=None):
    """
    Patch a 64-bit ELF shared library to have 16KB aligned PT_LOAD segments.
    Returns (True, message) on success/skip, (False, error) on failure.
    """
    in_place = output_path is None or output_path == input_path

    with open(input_path, 'rb') as f:
        orig = bytearray(f.read())

    # Validate ELF magic
    if orig[:4] != b'\x7fELF':
        return True, "skip: not ELF"

    # Only handle 64-bit ELF (ei_class=2)
    if orig[4] != 2:
        return True, "skip: 32-bit ELF"

    # Parse ELF header (little-endian 64-bit)
    e_phoff = struct.unpack_from('<Q', orig, 32)[0]
    e_phentsize = struct.unpack_from('<H', orig, 54)[0]
    e_phnum = struct.unpack_from('<H', orig, 56)[0]
    e_shoff = struct.unpack_from('<Q', orig, 40)[0]
    e_shentsize = struct.unpack_from('<H', orig, 58)[0]
    e_shnum = struct.unpack_from('<H', orig, 60)[0]

    if e_phentsize == 0 or e_phnum == 0:
        return True, "skip: no program headers"

    # Parse all program headers
    phdrs = []
    for i in range(e_phnum):
        base = e_phoff + i * e_phentsize
        if base + e_phentsize > len(orig):
            break
        p_type   = struct.unpack_from('<I', orig, base)[0]
        p_offset = struct.unpack_from('<Q', orig, base + 8)[0]
        p_vaddr  = struct.unpack_from('<Q', orig, base + 16)[0]
        p_paddr  = struct.unpack_from('<Q', orig, base + 24)[0]
        p_align  = struct.unpack_from('<Q', orig, base + 48)[0]
        phdrs.append({
            'idx': i, 'base': base,
            'p_type': p_type,
            'p_offset': p_offset, 'p_vaddr': p_vaddr, 'p_paddr': p_paddr,
            'p_align': p_align,
        })

    # Find PT_LOAD segments sorted by file offset
    pt_loads = sorted([p for p in phdrs if p['p_type'] == 1], key=lambda x: x['p_offset'])

    if not pt_loads:
        return True, "skip: no PT_LOAD"

    # Check if already 16KB consistent
    already_ok = all(
        (p['p_vaddr'] - p['p_offset']) % TARGET_ALIGN == 0 and p['p_align'] >= TARGET_ALIGN
        for p in pt_loads
    )
    if already_ok:
        return True, "already 16KB aligned"

    # Calculate insertions at original file positions
    # For each PT_LOAD where (p_vaddr - adjusted_p_offset) % TARGET_ALIGN != 0,
    # find minimum padding to insert AT the segment's (adjusted) start in the file.
    orig_insertions = []  # list of (original_file_position, padding_bytes)

    for phdr in pt_loads:
        orig_offset = phdr['p_offset']
        p_vaddr = phdr['p_vaddr']  # virtual address stays unchanged

        # Account for all previously planned insertions
        cumulative = sum(size for (pos, size) in orig_insertions if pos <= orig_offset)
        current_offset = orig_offset + cumulative

        # Check consistency at 16KB
        if (p_vaddr - current_offset) % TARGET_ALIGN == 0:
            continue  # This segment is already consistent

        # Calculate minimal padding to achieve consistency:
        # We need: (p_vaddr - (current_offset + padding)) % TARGET_ALIGN == 0
        # => padding ≡ (p_vaddr - current_offset) (mod TARGET_ALIGN)
        # => padding = (p_vaddr - current_offset) % TARGET_ALIGN (adjusted to be positive)
        current_mod = current_offset % TARGET_ALIGN
        target_mod = p_vaddr % TARGET_ALIGN
        padding = (target_mod - current_mod + TARGET_ALIGN) % TARGET_ALIGN

        if padding == 0:
            continue

        orig_insertions.append((orig_offset, padding))

    if not orig_insertions:
        # No insertions needed; just update p_align if required
        if all(p['p_align'] >= TARGET_ALIGN for p in pt_loads):
            return True, "no insertions needed"
        # Fall through to update p_align in place
        new_data = bytearray(orig)
    else:
        # Build new file content by inserting zero-padding at calculated positions
        insertions_sorted = sorted(orig_insertions, key=lambda x: x[0])
        new_data = bytearray()
        prev = 0
        for (ins_pos, ins_size) in insertions_sorted:
            new_data.extend(orig[prev:ins_pos])
            new_data.extend(b'\x00' * ins_size)
            prev = ins_pos
        new_data.extend(orig[prev:])

    # Helper: cumulative shift for an original file offset
    def shift(orig_off):
        return sum(size for (pos, size) in orig_insertions if pos <= orig_off)

    # Update ELF header: e_shoff (section header table offset)
    if e_shoff > 0:
        new_e_shoff = e_shoff + shift(e_shoff)
        struct.pack_into('<Q', new_data, 40, new_e_shoff)

    # Update ALL program headers: adjust p_offset and p_paddr; set p_align for PT_LOAD
    for phdr in phdrs:
        base = phdr['base']  # position in original file = same in new_data if before insertions
        # Program headers are typically at the start of the file (e_phoff ~ 0x40)
        # so they're before any insertions and their base positions don't change.
        orig_offset = phdr['p_offset']
        new_offset = orig_offset + shift(orig_offset)
        struct.pack_into('<Q', new_data, base + 8, new_offset)

        # Update p_paddr if it mirrors p_offset (physical address)
        if phdr['p_paddr'] == phdr['p_offset']:
            struct.pack_into('<Q', new_data, base + 24, new_offset)

        # For PT_LOAD: update p_align to TARGET_ALIGN
        if phdr['p_type'] == 1 and phdr['p_align'] < TARGET_ALIGN:
            struct.pack_into('<Q', new_data, base + 48, TARGET_ALIGN)

    # Update section headers: adjust sh_offset for each section
    if e_shoff > 0 and e_shnum > 0:
        new_e_shoff = e_shoff + shift(e_shoff)
        for i in range(e_shnum):
            orig_shdr_base = e_shoff + i * e_shentsize
            if orig_shdr_base + e_shentsize > len(orig):
                break
            sh_type = struct.unpack_from('<I', orig, orig_shdr_base + 4)[0]
            sh_offset = struct.unpack_from('<Q', orig, orig_shdr_base + 24)[0]

            if sh_type == 0:  # SHT_NULL
                continue

            new_sh_offset = sh_offset + shift(sh_offset)
            # The section header entry is at new_e_shoff + i * e_shentsize in new_data
            new_shdr_pos = new_e_shoff + i * e_shentsize
            struct.pack_into('<Q', new_data, new_shdr_pos + 24, new_sh_offset)

    # Write output
    out_path = output_path if output_path else input_path
    with open(out_path, 'wb') as f:
        f.write(new_data)

    total_padding = sum(size for (_, size) in orig_insertions)
    return True, f"patched: +{total_padding} bytes ({len(orig_insertions)} insertion(s))"


def patch_directory(directory):
    """Recursively patch all 64-bit .so files in a directory tree."""
    patched = 0
    skipped = 0
    errors = 0

    for root, dirs, files in os.walk(directory):
        for fname in files:
            if not fname.endswith('.so'):
                continue
            fpath = os.path.join(root, fname)
            ok, msg = patch_elf_16kb(fpath, fpath)
            if ok:
                if msg.startswith("patched"):
                    print(f"  PATCHED  {fname}: {msg}")
                    patched += 1
                elif "already" in msg or "skip" in msg:
                    skipped += 1
            else:
                print(f"  ERROR    {fname}: {msg}")
                errors += 1

    print(f"\nDone: {patched} patched, {skipped} skipped, {errors} errors")
    return errors == 0


if __name__ == '__main__':
    if len(sys.argv) == 2:
        path = sys.argv[1]
        if os.path.isdir(path):
            ok = patch_directory(path)
            sys.exit(0 if ok else 1)
        else:
            ok, msg = patch_elf_16kb(path, path)
            print(f"{path}: {msg}")
            sys.exit(0 if ok else 1)
    elif len(sys.argv) == 3:
        ok, msg = patch_elf_16kb(sys.argv[1], sys.argv[2])
        print(f"{sys.argv[1]} -> {sys.argv[2]}: {msg}")
        sys.exit(0 if ok else 1)
    else:
        print(__doc__)
        sys.exit(1)
