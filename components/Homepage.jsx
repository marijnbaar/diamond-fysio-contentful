import Team from './Team';
import Testimonial from './Testimonial';
import Footer from './Footer';
import Blog from './Blog';
import CTA from './CTA';
import Info from './Info';

export default function Homepage() {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        <main>
          <Info />
          <Blog />
          <Testimonial />
          <Team />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
