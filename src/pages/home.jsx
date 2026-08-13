import { FAQ } from '../components/faq'
import { UploadSection } from '../components/upload-section'
import { Footer } from '../components/footer'
import { OpenSource } from '../components/open-source'
const HomePage = () => {
  return (
    <div className="bg-[#F8F9FA]">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-8">
        <h1 className="font-bold text-2xl leading-10 text-[#363B3F] mb-2">
          dDocs and dSheets Walkaway
        </h1>
        <p className="font-normal text-base leading-6 text-[#77818A] mb-8">
          Independently recover all documents and spreadsheets tied to your
          accounts in case the main apps are down.
        </p>

        {/* Upload Section */}
        <UploadSection />

        <div className="w-full max-w-[912px] text-[#363b3f] text-lg sm:text-xl mb-4 font-bold leading-6 sm:leading-7">
          Your dDocs and dSheets, always accessible
        </div>

        <div className="mb-8">
          <p className="text-[#77818a] text-base font-normal leading-normal">
            Whatever happens to Fileverse,{' '}
            <a
              href="https://ddocs.new"
              target="_blank"
              className="text-[#5C0AFF] hover:underline"
            >
              ddocs.new
            </a>{' '}
            app or{' '}
            <a
              href="https://dsheets.new"
              target="_blank"
              className="text-[#5C0AFF] hover:underline"
            >
              dsheets.new
            </a>{' '}
            app, you should always have a way to independently retrieve your
            documents and spreadsheets. This page shows you how.
          </p>

          <p className="mt-5 text-[#77818a] text-base font-normal leading-normal">
            Unlike most Cloud-based apps, which can access your content, feed it
            to AI, censor it, or lock you out of your account, dDocs and dSheets
            are built to give you real data sovereignty and reliable backups.
            You are the ultimate owner of your files.
          </p>

          <p className="mt-5 text-[#77818a] text-base font-normal leading-normal">
            This{' '}
            <a
              href="https://walkaway.fileverse.eth.limo/"
              target="_blank"
              className="text-[#5C0AFF] hover:underline"
            >
              static page
            </a>{' '}
            gives you a simple way to interact directly with the decentralized
            networks (e.g. InterPlanetary File System) that hold the end-to-end
            encrypted backups of your files. From here you can download your
            documents and spreadsheets as PDF, Markdown (.md), or CSV files and
            decrypt them locally using your Backup Key, with no centralized
            third-parties in between. Nobody else can decrypt them but you.
          </p>

          <p className="mt-5 text-[#77818a] text-base font-normal leading-normal">
            What is a &quot;static&quot; page? It’s a website that runs entirely
            in your browser, minimising the amount of server-side
            processing.{' '}
          </p>
        </div>

        <OpenSource />

        {/* FAQ Section */}
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}

export { HomePage }
