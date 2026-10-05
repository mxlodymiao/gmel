import type { Person } from '../types';

export function Avatar({ person, size = 40 }: { person: Person; size?: number }) {
  const { avatar } = person;
  if ('src' in avatar) {
    return <img src={avatar.src} alt="" width={size} height={size} className="block shrink-0" style={{ width: size }} />;
  }

  // Letter sized and weighted to match the photo-style "M" monogram at any size
  return (
    <span
      aria-hidden
      style={{ backgroundColor: avatar.color, width: size, height: size, fontSize: size * 0.525 }}
      className="flex shrink-0 items-center justify-center rounded-full font-google-sans leading-none text-white"
    >
      {/* Google Sans sits ~1px high when centered; this matches the M's baseline */}
      <span className="translate-y-px">{person.name[0]}</span>
    </span>
  );
}
