import Fall from "./Fall";
import SpotlightCard from "./SpotlightCard";
import KineticText from "./KineticText";

const TESTIMONIALS = [
  { quote: "They built our chatbot in 10 days. It handles 80% of queries without a human. Support costs dropped by half.", name: "Sarah Mitchell", company: "UK Retail Group" },
  { quote: "20 hours a week on social media, down to zero. They automated everything. Content, scheduling, replies.", name: "Amitha Jayawardena", company: "Green Ceylon Exports" },
  { quote: "Delivered our analytics dashboard in 3 weeks. Any other agency would've taken 3 months.", name: "Mohamed Al-Rashid", company: "Gulf Trading Co." },
];

/** Each card arrives from its own direction and tilt. */
const ARRIVALS = [
  { x: -160, y: 60, rotate: -9 },
  { y: 160, rotate: 5 },
  { x: 160, y: 60, rotate: 9 },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-8 md:px-16">
        <Fall from={{ x: -120, rotate: -3 }} to={{ x: -80 }}>
          <h2 className="mb-16 text-[2.5rem] font-bold leading-[0.92] tracking-[-0.02em] md:mb-20 md:text-[4rem]">
            <KineticText lines={["Don't take our", "word for it."]} />
          </h2>
        </Fall>

        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, company }, i) => (
            <Fall key={name} from={ARRIVALS[i]} to={{ y: -90, rotate: -ARRIVALS[i].rotate / 2 }} delay={i * 0.04} className="h-full">
              <SpotlightCard className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-black p-8">
                <p className="mb-8 text-base leading-relaxed text-white/70">&ldquo;{quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="font-code mt-1 text-[10px] uppercase tracking-wider text-white/50">{company}</p>
                </div>
              </SpotlightCard>
            </Fall>
          ))}
        </div>
      </div>
    </section>
  );
}
