import { useGanza } from '../../state/useGanza'
import type { Page } from '../../lib/types'
import type { Strings } from '../../lib/i18n'

import Pay from './Pay'
import Loan from './Loan'
import Approvals from './Approvals'
import Deposit from './Deposit'
import Summary from './Summary'
import MemberHistory from './MemberHistory'
import AddMember from './AddMember'
import Past from './Past'
import Fines from './Fines'
import { Balance, LoansOut, AtBank } from './Balances'
import Analytics from './Analytics'
import Export from './Export'
import IkiminaSettings from './IkiminaSettings'
import AppSettings from './AppSettings'
import Profile from './Profile'
import Help from './Help'
import { Closed, Empty, Failed, Offline } from './States'

/** The nav-bar title for each pushed page. The state screens carry no title —
    their own headline is the title. */
export function pageTitle(page: Page, t: Strings, isMem: boolean): string {
  const titles: Partial<Record<Page, string>> = {
    summary: t.summary,
    approvals: t.approvals,
    pay: t.addPayment,
    loan: isMem ? t.requestLoan : t.offerLoan,
    member: t.member,
    member_self: t.history,
    addm: t.addMember,
    analytics: t.analytics,
    export: t.exportSheet,
    ik: t.ikSettings,
    settings: t.appSettings,
    deposit: t.deposit,
    past: t.pastMeetings,
    help: t.help,
    fines: t.finesOwed,
    profile: t.myProfile,
    balance: t.saved,
    loansout: t.loansOut,
    atbank: t.atBank,
    empty: t.recent,
    error: ' ',
    failed: ' ',
    closed: ' ',
  }
  return titles[page] ?? ''
}

/** Every pushed page renders inside the shared overlay, so there is no page
    anywhere in the app that a user can reach and not leave. */
export default function PageBody() {
  const { st } = useGanza()

  switch (st.page) {
    case 'pay': return <Pay />
    case 'loan': return <Loan />
    case 'approvals': return <Approvals />
    case 'deposit': return <Deposit />
    case 'summary': return <Summary />
    case 'member':
    case 'member_self': return <MemberHistory />
    case 'addm': return <AddMember />
    case 'past': return <Past />
    case 'fines': return <Fines />
    case 'balance': return <Balance />
    case 'loansout': return <LoansOut />
    case 'atbank': return <AtBank />
    case 'analytics': return <Analytics />
    case 'export': return <Export />
    case 'ik': return <IkiminaSettings />
    case 'settings': return <AppSettings />
    case 'profile': return <Profile />
    case 'help': return <Help />
    case 'error': return <Offline />
    case 'failed': return <Failed />
    case 'empty': return <Empty />
    case 'closed': return <Closed />
    default: return null
  }
}
