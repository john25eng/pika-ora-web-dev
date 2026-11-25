import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import AlertMessage from '../../components/AlertMessage';

export default function PasswordChanged() {
  return (
    <PageLayout title="Password Changed">
      <AlertMessage type="success">Your password has been changed.</AlertMessage>
      <Link to="/" className="btn btn-primary btn-sm">Back to home</Link>
    </PageLayout>
  );
}