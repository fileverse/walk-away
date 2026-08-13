import React from 'react'
import { ExternalLinkIcon } from '../assets/icons'

const OpenSource = () => {
  return (
    <div className="min-h-[12rem] h-auto  px-4 py-10 sm:p-4 bg-[#fff9ce] rounded-lg flex-col justify-start items-start gap-2 sm:gap-3 inline-flex">
      <div className="self-stretch text-[#363b3f] text-lg sm:text-xl font-bold leading-6 sm:leading-7">
        Open source
      </div>
      <div className="self-stretch text-[#363b3f] text-sm sm:text-base font-normal font-['Helvetica Neue'] leading-normal">
        <p className="text-[#77818a] text-base font-normal leading-normal">
          Don't trust, verify. This static page is open-source, you can check the code, modify it, and even self-host it for maximum autonomy and censorship resistance when retrieving your end-to-end encrypted files.
        </p>
        <p className="mt-5 text-[#77818a] text-base font-normal leading-normal">
          You can also access the page privately using its .onion address via the Tor Browser - dzarjqakfkvzv2rzdidap6opdaohsawvn3slqbozqfd3ltc5kvealvyd.onion; or access a decentralized <a href="https://walkaway.fileverse.eth.limo/" target="_blank" rel="noopener noreferrer" className="text-[#5C0AFF] hover:underline">hosted</a>  version.
        </p>
      </div>
      <div className="relative group"></div>
      <a
        href="https://github.com/fileverse/walk-away-ddocs"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="px-4 py-2 bg-black align-center rounded justify-center items-center gap-3 inline-flex cursor-pointer">
          <div className="text-white flex items-center gap-2 text-sm font-medium  leading-tight">
            View code on Github
          </div>
          <ExternalLinkIcon />
        </div>
      </a>

      {/* Custom Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Coming very soon
        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}

export { OpenSource }
