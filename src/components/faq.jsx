import React from 'react'
import { useState } from 'react'
import ChevronIcon from '../assets/chevron-icon'

/** @type {{ question: string, answer: import('react').ReactNode }[]} */
const agentFaqs = [
  {
    question: 'Where can I find my Backup Keys?',
    answer: (
      <>
        Go to either{' '}
        <a
          href="https://ddocs.new"
          target="_blank"
          className="text-[#5C0AFF] hover:underline"
        >
          ddocs.new
        </a>{' '}
        or{' '}
        <a
          href="https://dsheets.new"
          target="_blank"
          className="text-[#5C0AFF] hover:underline"
        >
          dsheets.new
        </a>
        , sign in to your account, open the sidebar, click on the Settings icon
        on the bottom left corner. In the settings page, simply go on
        &quot;Recovery&quot; and click &quot;download&quot; to save your Backup
        Keys. Keep those keys stored in a secure folder on your local device. Do
        not lose those keys.
      </>
    ),
  },
  {
    question: 'What can I do on this static page?',
    answer: (
      <>
        This powerful static page lets you retrieve all your dDocs (PDFs or .MD)
        and dSheets, ensuring you always have access to your content, no matter
        what happens to the Fileverse team or Apps. Just upload your Backup Keys
        to download all your files.
      </>
    ),
  },
  {
    question: 'What are the advantages of a static page?',
    answer: (
      <>
        This static page grants you greater agency over your files and backups.
        A static page minimizes the amount of server-side processing, allowing
        you to download the whole page, modify it, use it offline in complete
        privacy, and configure your own infrastructure (eg. IPFS gateways) to
        eliminate third-party dependencies.
        <br />
        <br />
        The static page is also hosted and accessible via any public IPFS
        gateway from which you can download it, improving the
        censorship-resistance of your documents & spreadsheets. It is also
        accessible via Tor hidden service via our{' '}
        <a
          href="http://dzarjqakfkvzv2rzdidap6opdaohsawvn3slqbozqfd3ltc5kvealvyd.onion/"
          target="_blank"
          className="text-[#5C0AFF] hover:underline"
        >
          .onion
        </a>{' '}
        address, and its verifiable ENS domain.
      </>
    ),
  },
  {
    question: 'Why did Fileverse build this page?',
    answer: (
      <>
        We believe in true data ownership and self-sovereignty. Unlike
        traditional platforms that lock you in,{' '}
        <a
          href="https://ddocs.new"
          target="_blank"
          className="text-[#5C0AFF] hover:underline"
        >
          ddocs.new
        </a>{' '}
        &{' '}
        <a
          href="https://dsheets.new"
          target="_blank"
          className="text-[#5C0AFF] hover:underline"
        >
          dsheets.new
        </a>{' '}
        ensure you can always access your documents and spreadsheets. This
        backup page guarantees your content can be retrieved and stay in your
        hands, no matter what happens to the main front-ends of the apps.
      </>
    ),
  },
  {
    question: 'What happens if I don’t download my backup keys?',
    answer: (
      <>
        Without your Backup Keys, you won’t be able to decrypt and retrieve your
        files. We highly recommend downloading them in advance from your account
        settings.
      </>
    ),
  },
  {
    question: 'What do I do if I can’t recover my files?',
    answer: (
      <>
        Please reach out to us at{' '}
        <a
          href="mailto:hello@fileverse.io"
          className="text-[#5C0AFF] hover:underline"
        >
          hello@fileverse.io
        </a>{' '}
        or on{' '}
        <a
          href="https://x.com/fileverse"
          target="_blank"
          className="text-[#5C0AFF] hover:underline"
        >
          Twitter
        </a>{' '}
        💛
      </>
    ),
  },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="w-full max-w-[912px] px-4 sm:px-0 mt-6 sm:mt-10 text-[#363b3f] text-xl mb-4 font-bold leading-7">
      <div className="text-[#363b3f] text-base sm:text-lg font-semibold leading-normal">
        Frequently Asked Questions
      </div>

      <div className=" mt-3 sm:mt-4">
        {agentFaqs.map((faq, index) => (
          <div
            key={index}
            className={`border-b border-gray-200 ${index === -1 ? 'border-t' : ''
              }`}
          >
            <button
              className="w-full flex justify-between items-center py-3 sm:py-4 text-left cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="text-[#363b3f] text-xs sm:text-sm font-medium pr-4">
                {faq.question}
              </span>
              <div
                className={`transform transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''
                  }`}
              >
                <ChevronIcon />
              </div>
            </button>

            {openIndex === index && (
              <div className="pb-3 sm:pb-4 text-xs sm:text-sm font-normal leading-5 text-[#363B3F]">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export { FAQ }
