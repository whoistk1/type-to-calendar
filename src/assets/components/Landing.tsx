interface LandingProps {
    appName: string;
}

export function Landing({ appName }: LandingProps){
    return(
        <section>
            <h2>
                Welcome to {appName}!
            </h2>
        </section>
    );
}