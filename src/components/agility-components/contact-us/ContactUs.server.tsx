import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'
import { getContentItem } from '@/lib/cms/getContentItem'
import type { UnloadedModuleProps } from '@agility/nextjs'
import { ContactUsClient } from './ContactUs.client'

interface IContactUs {
	heading: string
	description: string
	submitURL: string
	successMessage: string
	errorMessage: string
	loadingMessage: string
	address: string
	phone: string
	email: string
}

/**
 * ContactUs server component for displaying contact form and information.
 * This component fetches content from Agility CMS and displays a contact section with form and contact details.
 *
 * @param {UnloadedModuleProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered contact section.
 */
export const ContactUs = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: {
			heading,
			description,
			submitURL = '/api/contact', // Default fallback URL
			successMessage = 'Thank you for your message! We\'ll get back to you soon.',
			errorMessage = 'Sorry, there was an error sending your message. Please try again.',
			loadingMessage = 'Sending your message...',
			address,
			phone,
			email
		},
		contentID,
	} = await getContentItem<IContactUs>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	return (
		<Container className="mt-16 sm:mt-24" data-agility-component={contentID}>
			<div className="mx-auto max-w-7xl">
				<div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
					{/* Contact Information */}
					<div>
						<Subheading data-agility-field="heading">Get in touch</Subheading>
						<Heading as="h2" className="mt-2 max-w-lg" data-agility-field="heading">
							{heading}
						</Heading>
						<p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300" data-agility-field="description">
							{description}
						</p>

						<div className="mt-10 space-y-4 text-base leading-7 text-gray-600 dark:text-gray-300">
							{address && (
								<div className="flex gap-x-4" data-agility-field="address">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
										<svg className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.757.433l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
										</svg>
									</div>
									<div>
										<p className="font-semibold text-gray-900 dark:text-gray-100">Office</p>
										<p className="mt-1">{address}</p>
									</div>
								</div>
							)}

							{phone && (
								<div className="flex gap-x-4" data-agility-field="phone">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
										<svg className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
										</svg>
									</div>
									<div>
										<p className="font-semibold text-gray-900 dark:text-gray-100">Phone</p>
										<p className="mt-1">
											<a href={`tel:${phone}`} className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
												{phone}
											</a>
										</p>
									</div>
								</div>
							)}

							{email && (
								<div className="flex gap-x-4" data-agility-field="email">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
										<svg className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
											<path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
										</svg>
									</div>
									<div>
										<p className="font-semibold text-gray-900 dark:text-gray-100">Email</p>
										<p className="mt-1">
											<a href={`mailto:${email}`} className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
												{email}
											</a>
										</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Contact Form */}
					<ContactUsClient
						submitURL={submitURL}
						successMessage={successMessage}
						errorMessage={errorMessage}
						loadingMessage={loadingMessage}
					/>
				</div>
			</div>
		</Container>
	)
}
