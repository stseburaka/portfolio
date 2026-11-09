import type { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/layout/Container"

const title = "Зноў | Znów | Again | Опять"
const introduction =
  "An artistic investigation into how Belarusian communities in exile build networks of solidarity and care while also reproducing forms of exclusion."
const creditLinkClass = "underline underline-offset-2 hover:text-ink"

export const metadata: Metadata = {
  title: `${title} — Andrei Stseburaka`,
  description: introduction,
}

export default function AgainPage() {
  return (
    <Container>
      <article className="mx-auto max-w-[680px] py-10 sm:py-16">
        <Link href="/a" className="home-link font-mono text-sm">
          ← Back
        </Link>

        <h1 className="mt-8 font-mono text-3xl font-medium leading-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed">{introduction}</p>

        <div className="mt-8 space-y-5 text-base leading-[1.75] text-ink-2">
          <p>
            The project begins with Andrei Stseburaka’s experience of repeated migration, seeking
            refuge, and feeling increasingly out of place in the alternative political structures
            taking shape in exile. That sense of not belonging became a starting point for
            examining how exclusion operates within communities formed in response to it.
          </p>
          <p>
            The work focuses on Belarusian democratic initiatives and exile communities,
            primarily in Poland, in the wake of the protests of 2020–2022 and the repression that
            forced many people to leave. These communities organize resistance and build networks
            of care and support. Within those same networks, LGBTQ+ people, migrants, and others
            can encounter familiar patterns of marginalization. The project brings these
            experiences into the same space through documentary photography, urban interventions,
            infographics, surveys, and interviews.
          </p>
          <p>
            One photographic series shifts attention from the faces of women involved in the
            protests to their feet. It foregrounds the many bodies and voices involved in
            political action and asks who can appear in public safely. Conceived as a sequence of
            five images, the series traces a shift in how the movement was represented, from
            grassroots initiatives in which women played a central role to the figure of a male
            official. Accompanying images examine how democratic initiatives in exile can adopt
            the visual codes and ceremonies of the power they oppose.
          </p>
          <p>
            For another part of the project, Stseburaka placed three posters in public space
            addressing violence against women, LGBTQ+ rights, and migrants’ rights. He photographed
            the posters over time to observe how they changed in the street. Alongside the surveys
            and interviews, the intervention made room for responses beyond official accounts.
          </p>
          <p>
            The title refers to a struggle that continues day after day and to the need to
            examine the structures built through that struggle. Shared experiences of repression
            can bring people together, while the communities they form can develop exclusions of
            their own. Questioning those exclusions within one’s own circle is part of sustaining
            solidarity.
          </p>
        </div>

        <section className="mt-10 border-t border-border pt-5 text-sm leading-relaxed text-ink-2">
          <h2 className="font-mono font-medium text-ink">Credits</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt>Artist</dt>
            <dd>Andrei Stseburaka</dd>
            <dt>Curatorial text</dt>
            <dd>
              <a href="https://www.instagram.com/a.stebur/" className={creditLinkClass}>Antonina Stebur</a>
            </dd>
            <dt>Mentor</dt>
            <dd>
              <a href="https://www.instagram.com/katerina_kouzmitcheva/" className={creditLinkClass}>Katerina Kouzmitcheva</a>
            </dd>
            <dt>Special thanks</dt>
            <dd>
              <a href="https://www.instagram.com/kseniamaliukova/" className={creditLinkClass}>Ksenia Maliukova</a>
            </dd>
          </dl>
          <p className="mt-4">
            Created as part of DO ART TOGETHER, an eight-month artistic mentorship programme organised by{" "}
            <a href="https://www.instagram.com/picturedocfoundation/" className={creditLinkClass}>Picture Doc Foundation</a>
            {" "}and funded by the City of Warsaw.
          </p>
          <p className="mt-2">
            With additional thanks to{" "}
            <a href="https://www.instagram.com/duzypokoj/" className={creditLinkClass}>Duży Pokój</a>
            {" "}and{" "}
            <a href="https://www.instagram.com/fsh1_platform/" className={creditLinkClass}>FSh1 Platform</a>.
          </p>
        </section>
      </article>
    </Container>
  )
}
