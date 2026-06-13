interface MarqueeProps {
  items: string[];
}

export const Marquee = ({ items }: MarqueeProps) => {
  const list = [...items, ...items];

  return (
    <div
      className="overflow-hidden border-y border-[#D1CDBC] bg-[#F7F5F0] py-6"
      data-testid="editorial-marquee"
    >
      <div className="flex w-max animate-marquee gap-24 whitespace-nowrap">
        {list.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-24 font-display text-3xl font-medium tracking-tight text-[#121710]"
          >
            <span>{item}</span>
            <span aria-hidden className="h-2 w-2 rounded-full bg-[#C45B38]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
