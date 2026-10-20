import { BackgroundHero } from "./BackgroundHero";
import { BentoSection } from "./BentoSection";
import { CompanyStats } from "./company-stats";
import { StatsStrip } from "./stats-strip";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { LogoStrip } from "./logo-strip/LogoStrip";
import NoComponentFound from "./NoComponentFound";
import { PostListing } from "./post-listing/PostListing.server";
import PostDetails from "./post-details/PostDetails";
import { PricingCards } from "./pricing/PricingCards";
import { PricingTable } from "./pricing/PricingTable";
import { FrequentlyAskedQuestions } from "./pricing/FrequentlyAskedQuestions";
import { Testimonial } from "./testimonial/TestimonialServer";
import { Testimonials } from "./testimonials/TestimonialsServer";

import RichTextArea from "./RichTextArea";
import { TeamListing } from "./TeamListing";
import { ABTestHero } from "./ABTestHero";
import { Carousel } from "./carousel/Carousel";
import { ContactUs } from "./contact-us";
import { PersonalizedLogoStrip } from "./personalized-logo-strip/PersonalizedLogoStrip";
import { PersonalizedBackgroundHero } from "./PersonalizedBackgroundHero";


// All of the Agility Page Module Components that are in use in this site need to be imported into this index file.
// Place Page Modules in allModules array below, passing in a name and the component.

const allModules = [
	{ name: "RichTextArea", module: RichTextArea },
	{ name: "BackgroundHero", module: BackgroundHero },
	{ name: "BentoSection", module: BentoSection },
	{ name: "CompanyStats", module: CompanyStats },
	{ name: "StatsStrip", module: StatsStrip },
	{ name: "Header", module: Header },
	{ name: "Hero", module: Hero },
	{ name: "ABTestHero", module: ABTestHero },
	{ name: "LogoStrip", module: LogoStrip },
	{ name: "PostListing", module: PostListing },
	{ name: "PostDetails", module: PostDetails },
	{ name: "PricingCards", module: PricingCards },
	{ name: "PricingTable", module: PricingTable },
	{ name: "FrequentlyAskedQuestions", module: FrequentlyAskedQuestions },
	{ name: "Testimonial", module: Testimonial },
	{ name: "Testimonials", module: Testimonials },
	{ name: "TeamListing", module: TeamListing }
	, { name: "Carousel", module: Carousel }
	, { name: "ContactUs", module: ContactUs }
	, { name: "PersonalizedLogoStrip", module: PersonalizedLogoStrip }
	, { name: "PersonalizedBackgroundHero", module: PersonalizedBackgroundHero }
];

/**
 * Get the Agility Component/Module by name.
 * If the component is not found, a default component will be returned.
 * @param moduleName
 * @returns
 */
export const getModule = (moduleName: string): any | null => {

	if (!moduleName) return null;
	const obj = allModules.find(
		(m) => m.name.toLowerCase() === moduleName.toLowerCase()
	);
	if (!obj) return NoComponentFound;
	return obj.module
};
