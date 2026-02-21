export async function generateStaticParams() {
    return [{ id: '1' }];
}

export default function CotizacionIdLayout({ children }: { children: React.ReactNode }) {
    return (
        <>{children}</>
    );
}
