import Team from './Team';
import Footer from './Footer';
import CTA from './CTA';

export default function Homepage() {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        <main>
          <Team />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
