import React from 'react'

const Footer = () => {
  return (
    <>
      <div className="font-sans text-xs leading-4 text-[#77818A] flex gap-4 p-10">
        <span>2024-2026 Fileverse Ltd.</span>
        <span>
          <a
            href="https://docs.fileverse.io/acceptable-use"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#363B3F]"
          >
            Acceptable Use
          </a>
          {' | '}
          <a
            href="https://docs.fileverse.io/tos"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#363B3F]"
          >
            Terms
          </a>
          {' | '}
          <a
            href="https://docs.fileverse.io/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#363B3F]"
          >
            Privacy
          </a>
        </span>
      </div>
    </>
  )
}

export { Footer }
