import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import './Admin.css';

const inviteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must not exceed 50 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address')
});

export default function InviteAdmin() {
  const { session } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: '', email: '' }
  });

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      const token = session?.access_token;
      if (!token) throw new Error('Authorization session token is missing');

      await authService.inviteAdmin(data.email, data.name, token);
      toast.success(`Invitation successfully dispatched to ${data.email}`);
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch administrative invitation');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__hero">
        <h2>Invite Administrator</h2>
        <p>
          Send an email invitation containing a secure registration link to establish a new admin profile.
        </p>
      </header>

      <motion.div
        className="admin-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ maxWidth: '600px', margin: '2rem 0' }}
      >
        <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label>
            Full Name
            <input
              type="text"
              className={errors.name ? 'input--invalid' : ''}
              disabled={submitting}
              placeholder="e.g. John Doe"
              {...register('name')}
            />
          </label>
          {errors.name && <p className="admin-error" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>{errors.name.message}</p>}

          <label>
            Email Address
            <input
              type="email"
              className={errors.email ? 'input--invalid' : ''}
              disabled={submitting}
              placeholder="e.g. admin@liams.in"
              {...register('email')}
            />
          </label>
          {errors.email && <p className="admin-error" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>{errors.email.message}</p>}

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Sending Invite...' : 'Send Invitation'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
