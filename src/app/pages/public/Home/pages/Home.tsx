import React from "react";
import Hero from "../components/Hero";
import Topbar from "../components/Topbar";
import Brand from "../components/Brand";
import Transform from "../components/Transform";
import Partners from "../components/Partners";
import WithoutCommitment from "../components/WithoutCommitment";
import AboutUs from "../components/AboutUs";
import Plans from "../components/Plans";
import Advertising from "../components/Advertising";
import CommonQuestion from "../components/CommonQuestion";
import Footer from "../components/Footer";

export default function Home() {
    return (
        <>
            <Topbar/>
            <Hero>
                <Brand />
            </Hero>
            <Transform />
            <Partners />
            <WithoutCommitment />
            <AboutUs />
            <Plans />
            <Advertising />
            <CommonQuestion />
            <Footer />
        </>
    );
}
