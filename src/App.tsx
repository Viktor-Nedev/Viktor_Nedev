import { SmoothScrollProvider } from './hooks/useLenis';
import { Loader } from './components/chrome/Loader';
import { Cursor } from './components/chrome/Cursor';
import { Snow } from './components/ui/Snow';
import { Nav } from './components/chrome/Nav';
import { ScrollProgress } from './components/chrome/ScrollProgress';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Services } from './components/sections/Services';
import { Work } from './components/sections/Work';
import { Games } from './components/sections/Games';
import { Certificates } from './components/sections/Certificates';
import { Resume } from './components/sections/Resume';
import { Booking } from './components/sections/Booking';
import { Contact } from './components/sections/Contact';
import { useT } from './i18n';

export function App() {
  const t = useT();

  return (
    <SmoothScrollProvider>
      <Loader />
      <Cursor />
      <Snow />


      <ScrollProgress />
      <Nav />

      <a href="#main" className="skip-link">
        {t.nav.menu}
      </a>

      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Services />
        <Work />
        <Games />
        <Certificates />
        <Resume />
        <Booking />
      </main>

      <Contact />
    </SmoothScrollProvider>
  );
}
