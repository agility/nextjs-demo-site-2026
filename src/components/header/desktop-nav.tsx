"use client"

import type { ILink } from "@/lib/cms-content/getHeaderContent"
import Link from "next/link"
import { PlusGridIcon, PlusGridItem } from "../plus-grid"
import React, { useState } from 'react'
import { localizeUrlField } from '@/lib/i18n/localizeUrl'
import type { Locale } from '@/lib/i18n/config'
import {
	Dialog,
	DialogPanel,
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Popover,
	PopoverButton,
	PopoverGroup,
	PopoverPanel,
} from '@headlessui/react'
import {
	ArrowPathIcon,
	Bars3Icon,
	ChartPieIcon,
	CursorArrowRaysIcon,
	FingerPrintIcon,
	SquaresPlusIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import { DarkModeToggle } from "./dark-mode-toggle"


interface Props {
	links: ILink[]
	locale: string
}

export function DesktopNav({ links, locale }: Props) {

	return (

		<PopoverGroup as="nav" className="hidden lg:flex">

			{links.map(({ link, subNavLinks, bottomLink1, bottomLink2 }, index) => (
				<React.Fragment key={`${link.href}-${index}`}>
					{
						(subNavLinks && subNavLinks.length > 0) ? (

							<Popover as="div" className={"group/item relative flex"}>
								<PlusGridItem className="relative flex " >

									<PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 dark:text-gray-100 cursor-pointer px-4 py-3 relative group">
										<span className="flex items-center text-base font-medium  transition-colors duration-200 relative ">
											<span className="relative z-10">{link.text}</span>

										</span>
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800/60 dark:bg-gray-200/60 group-hover:w-full transition-all duration-300 ease-out"></span>

										<ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-700 dark:text-gray-300 group-data-open:rotate-180 group-data-open:transform transition-transform" />
									</PopoverButton>
								</PlusGridItem>



								<PopoverPanel

									transition
									className="absolute left-1/2 z-10 mt-14 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-white dark:bg-slate-700 backdrop-blur-lg shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-100/5 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
								>
									{({ close }) => (
										<>
											<div className="p-4 bg-gray-300/70 dark:bg-slate-600 backdrop-blur-sm text-center">
												<Link
													href={localizeUrlField(link, locale as Locale)}
													target={link.target}
													className="text-lg px-3 p-1 rounded transition-colors font-medium text-gray-950 dark:text-gray-100 text-center relative group inline-block"
													onClick={() => close()} // Close the popover when the link is clicked
												>
													<span className="relative z-10 transition-colors duration-200 hover:text-gray-800 dark:hover:text-gray-200">{link.text}</span>
													<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800/60 dark:bg-gray-200/60 group-hover:w-full transition-all duration-300 ease-out"></span>
												</Link>
											</div>

											<div className="p-4">

												{subNavLinks.map(({ link, description, icon }, index) => (
													<Link href={localizeUrlField(link, locale as Locale)}
														key={`${link.href}-${index}`}
														target={link.target}
														className="group relative flex gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50/25 dark:hover:bg-gray-700/25 hover:backdrop-blur-sm transition-all duration-200"
														onClick={() => close()} // Close the popover when the link is clicked
													>
														<div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-white/30 dark:bg-gray-700/30 group-hover:bg-gray-50/30 dark:group-hover:bg-gray-600/30 group-hover:shadow-md transition-all duration-200">
															<img src={icon?.url} alt={icon?.label} aria-hidden="true" className="size-6 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-all duration-200 dark:grayscale" />
														</div>
														<div className="flex-auto">
															<span className="block font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200">
																{link.text}
																<span className="absolute inset-0" />
															</span>
															<p className="mt-1 text-gray-600 dark:text-gray-300">{description}</p>
														</div>
													</Link>
												))}
											</div>
											<div className="grid grid-cols-2 divide-x divide-gray-900/10 dark:divide-gray-100/10 bg-gray-300/20 dark:bg-slate-600 backdrop-blur-sm">
												{bottomLink1 && (
													<Link
														href={localizeUrlField(bottomLink1, locale as Locale)}
														target={bottomLink1.target}
														className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50/25 dark:hover:bg-gray-700/25 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 relative group"
														onClick={() => close()}
													>
														{/* <bottomLink1.icon aria-hidden="true" className="size-5 flex-none text-gray-400" /> */}
														{bottomLink1.text}
														<span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gray-800/60 dark:bg-gray-200/60 group-hover:w-1/2 transition-all duration-300 ease-out"></span>
													</Link>
												)}

												{bottomLink2 && (
													<Link
														href={localizeUrlField(bottomLink2, locale as Locale)}
														target={bottomLink2.target}
														className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50/25 dark:hover:bg-gray-700/25 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 relative group"
														onClick={() => close()}
													>
														{/* <bottomLink2.icon aria-hidden="true" className="size-5 flex-none text-gray-400" /> */}
														{bottomLink2.text}
														<span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gray-800/60 dark:bg-gray-200/60 group-hover:w-1/2 transition-all duration-300 ease-out"></span>
													</Link>
												)}

											</div>
										</>
									)}
								</PopoverPanel>

							</Popover>
						) : (
							<PlusGridItem className="relative flex justify-center px-2" >
								<Link
									href={localizeUrlField(link, locale as Locale)}
									target={link.target}
									className="flex items-center px-4 py-3 text-base font-medium text-gray-950 dark:text-gray-100 relative group"
								>
									<span className="relative z-10 transition-colors duration-200 hover:text-gray-800 dark:hover:text-gray-200">{link.text}</span>
									<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-800/60 dark:bg-gray-200/60 group-hover:w-full transition-all duration-300 ease-out"></span>
								</Link>
							</PlusGridItem>)
					}
				</React.Fragment>
			))}
		</PopoverGroup>

	)
}