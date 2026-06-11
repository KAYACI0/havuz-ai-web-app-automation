export function buildPoolPrompt(
  model: string,
  size: string,
  deck: string,
  ceramic: string
): string {
  return `
    Add a ${model} model prefabricated swimming pool (${size} meters) to the open ground or grass area visible in this image.
    ${deck ? `Surround the pool with ${deck} colored wooden deck.` : ""}
    ${ceramic ? `Pool interior with ${ceramic} colored ceramic tiles.` : ""}
    The pool must look completely realistic and naturally integrated into the existing outdoor space.
    Keep every existing element in the scene exactly as-is — do not add, remove, or modify any structures, buildings, trees, fences, or landscaping that are already present.
    Only insert the pool into an available open area. Professional photography, natural daylight, photorealistic quality.
  `.trim();
}
