import React from 'react';
import { useTravel } from '../context/TravelContext';

const Footer: React.FC = () => {
    const { t } = useTravel();
    return (
        <footer style={{
            textAlign: 'center',
            padding: 'var(--spacing-md)',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
            marginTop: 'auto'
        }}>
            <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
        </footer>
    );
};

export default Footer;
