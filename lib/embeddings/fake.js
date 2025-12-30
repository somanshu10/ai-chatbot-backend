export function fakeEmbed(text) {
  const vec = new Array(768).fill(0);
  for (let i = 0; i < text.length && i < 768; i++) {
    vec[i] = text.charCodeAt(i) / 255;
  }
  return vec;
}
