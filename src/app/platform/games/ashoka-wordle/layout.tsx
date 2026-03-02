import DeveloperCredits from '@/components/developer-credits';

export default function AshokaWordleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container py-8">
            {children}

            <DeveloperCredits
                developers={[
                    { name: 'Soham Tulsyan', profileUrl: 'https://www.linkedin.com/in/soham-tulsyan-0902482a7/', role: 'Lead Developer' },
                    { name: 'Eeshaja Swami', role: 'UI/UX Designer' }
                ]}
            />
        </div>
    );
}
