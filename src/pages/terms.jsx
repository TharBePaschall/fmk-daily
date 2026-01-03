import { Link } from 'react-router-dom'

function Terms() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 hover:opacity-80 transition-opacity">
              FMK Daily
            </h1>
          </Link>
        </header>

        <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last Updated: January 3, 2026</p>

          <div className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using FMK Daily ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">2. Description of Service</h2>
              <p>
                FMK Daily is a free entertainment game that presents users with three historical or pop culture personalities daily. Users assign each personality to one of three categories (F, M, or K) and may share their choices with others.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">3. User Eligibility</h2>
              <p>
                You must be at least 18 years old to use this Service. By using FMK Daily, you represent and warrant that you are 18 years of age or older.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">4. Nature of the Game</h2>
              <p>
                FMK Daily is purely a hypothetical entertainment game. The categories represent abstract choices in a party game context and do not promote, encourage, or endorse any real-world actions. The inclusion of any personality in this game does not imply any endorsement by, association with, or opinion about that individual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">5. User Conduct</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to manipulate, hack, or exploit the Service</li>
                <li>Share content from the Service in a manner intended to harass, defame, or harm any individual</li>
                <li>Misrepresent your results or impersonate others</li>
                <li>Use automated systems to access the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">6. Intellectual Property</h2>
              <p className="mb-2"><strong className="text-white">Our Content:</strong> The FMK Daily name, logo, and original code are owned by us. You may not copy, modify, or distribute our proprietary content without permission.</p>
              <p className="mb-2"><strong className="text-white">Third-Party Content:</strong> Biographical information and images are sourced from Wikipedia via their public API and are subject to Wikipedia's licensing terms (Creative Commons Attribution-ShareAlike License). We do not claim ownership of this content.</p>
              <p><strong className="text-white">Your Content:</strong> By sharing your results, you grant us a non-exclusive license to display your shared choices to other users of the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">7. Data Collection and Privacy</h2>
              <p className="mb-2">We collect and store:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                <li>An anonymous device identifier to limit play to once per day</li>
                <li>Your daily game choices</li>
                <li>Share codes for the sharing feature</li>
              </ul>
              <p className="mb-2">Unless voluntarily provided by users, we do not collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                <li>Your name or personal identity</li>
                <li>Email addresses</li>
              </ul>
              <p>
                Data is stored using Supabase and may be retained indefinitely to maintain game functionality. We do not sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">8. Disclaimer of Warranties</h2>
              <p className="font-semibold">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">9. Limitation of Liability</h2>
              <p className="font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED $0, AS THIS IS A FREE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless FMK Daily and its creators from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">11. Modifications to Service and Terms</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We may also update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">12. Termination</h2>
              <p>
                We reserve the right to terminate or restrict your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">13. Governing Law</h2>
              <p>
                These Terms shall be governed by the laws of the United States. Any disputes shall be resolved in the courts of Texas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">14. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700 text-center">
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 via-amber-500 to-slate-700 text-white rounded-xl font-bold hover:scale-105 transition-all"
            >
              Back to Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms

