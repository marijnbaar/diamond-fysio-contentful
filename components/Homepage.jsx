import Team from './Team';
import Testimonial from './Testimonial';
import Footer from './Footer';
import CTA from './CTA';

export default function Homepage() {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        <main>
          <Testimonial />
          <Team />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
