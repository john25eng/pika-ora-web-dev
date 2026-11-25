import { Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import AlertMessage from '../../components/layout/AlertMessage';

export default function PasswordChanged() {
  return (
    <PageLayout title="Password Changed">
      <AlertMessage type="success">Your password has been changed.</AlertMessage>
      <Link to="/" className="btn btn-primary btn-sm">Back to home</Link>
    </PageLayout>
  );
}