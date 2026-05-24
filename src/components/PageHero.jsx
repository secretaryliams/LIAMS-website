import { motion } from 'framer-motion';
import NeuralBackground from './NeuralBackground';
import './PageHero.css';

export default function PageHero({ title, subtitle, label }) {
  return (
    <section className="page-hero">
      <NeuralBackground variant="mini" />
      <motion.div
        className="container page-hero__inner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {label && <span className="page-hero__label">{label}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </motion.div>
    </section>
  );
}
