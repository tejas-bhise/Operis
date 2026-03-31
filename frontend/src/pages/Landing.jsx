import React from 'react';
import Navbar    from '../components/landing/Navbar';
import Hero      from '../components/landing/Hero';
import WhyUs     from '../components/landing/WhyUs';
import Features  from '../components/landing/Features';
import Output    from '../components/landing/Output';
import UseCases  from '../components/landing/UseCases';
import Footer    from '../components/landing/Footer';

export default function Landing() {
  return (
    <div style={{ width:'100%', minHeight:'100vh', background:'var(--bg)', margin:0, padding:0, overflowX:'hidden' }}>
      <Navbar />
      <Hero />
      <WhyUs />
      <Features />
      <Output />
      <UseCases />
      <Footer />
    </div>
  );
}