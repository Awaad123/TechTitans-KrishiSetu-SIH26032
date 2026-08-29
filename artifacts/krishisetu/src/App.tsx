import * as React from 'react';
import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import {
  ArrowRight, Bell, CalendarDays, Check, ChevronRight, CircleCheck, Clock3,
  CloudSun, FileText, IndianRupee, Leaf, LogIn, LogOut, MapPin, Menu, PackageCheck,
  Phone, Plus, Search, ShieldCheck, Sprout, Ticket, Tractor, UserRound, Users,
  X, Wheat, RefreshCw
} from 'lucide-react';
import {
  useCancelBooking, useCreateBooking, useCreateCentre, useCreateSlot, useGetAdminSummary,
  useGetBooking, useGetCurrentUser, useGetFarmerDashboard, useListBookings,
  useListCentres, useListFarmers, useListNotifications, useListSlots, useLogin,
  useLogout, useRegisterFarmer, useUpdateBookingStatus,
  getGetBookingQueryKey, getGetCurrentUserQueryKey, getGetFarmerDashboardQueryKey, getListBookingsQueryKey,
  getGetAdminSummaryQueryKey,
  getListCentresQueryKey, getListFarmersQueryKey, getListNotificationsQueryKey,
  getListSlotsQueryKey, type Booking, type Slot, type User
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import '@/index.css';

const queryClient = new QueryClient();

const fmtDate = (value?: string | null) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
const money = (value?: number | null) => value == null ? '—' : `₹${value.toLocaleString('en-IN')}`;
const initials = (name?: string | null) => (name || 'KS').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

function Mark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark ${small ? 'brand-mark-small' : ''}`} aria-hidden="true"><Wheat size={small ? 15 : 20} strokeWidth={2.2} /></span>;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand ${inverse ? 'brand-inverse' : ''}`} data-testid="link-brand">
    <Mark small /><span>Krishi<span className="brand-accent">Setu</span></span>
  </Link>;
}

function Button({ children, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'quiet' | 'outline' | 'danger' }) {
  return <button {...props} className={`ks-button ks-button-${variant} ${props.className || ''}`}>{children}</button>;
}

function LoadingBlock({ label = 'Gathering your field notes…' }: { label?: string }) {
  return <div className="state-card" data-testid="state-loading"><div className="loading-line loading-wide" /><div className="loading-line" /><p>{label}</p></div>;
}

function ErrorBlock({ retry }: { retry?: () => void }) {
  return <div className="state-card state-error" data-testid="state-error"><CircleCheck size={22} /><h3>We couldn’t reach the records</h3><p>Check your connection and try again. Your progress is safe.</p>{retry && <Button variant="outline" onClick={retry}><RefreshCw size={15} /> Try again</Button>}</div>;
}

function EmptyBlock({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className="state-card state-empty" data-testid="state-empty"><div className="empty-seal"><Leaf size={22} /></div><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

function Badge({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'green' | 'slate' | 'red' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function PageHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1 className="font-display">{title}</h1>{detail && <p>{detail}</p>}</div>{action}</div>;
}

function AppShell({ children, user, admin = false }: { children: ReactNode; user?: User | null; admin?: boolean }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useLogout();
  const farmerLinks = [
    ['/farmer', 'Overview', Sprout], ['/farmer/book', 'Book a slot', CalendarDays],
    ['/farmer/token', 'My token', Ticket], ['/farmer/track', 'Track payment', IndianRupee],
    ['/farmer/notifications', 'Notifications', Bell],
  ] as const;
  const adminLinks = [['/admin', 'Operations', ShieldCheck], ['/admin/manage', 'Manage centres', MapPin]] as const;
  const links = admin ? adminLinks : farmerLinks;
  const signOut = () => logout.mutate(undefined, { onSuccess: () => setLocation('/login') });
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><Logo inverse /><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <div className="sidebar-context"><span className="context-kicker">{admin ? 'PUBLIC PROCUREMENT' : 'FARMER SPACE'}</span><span className="context-name">{admin ? 'Madhya Pradesh • 04' : user?.village || 'Your village'}</span></div>
      <nav className="side-nav" aria-label="Main navigation">{links.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`side-link ${location === href ? 'side-link-active' : ''}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={18} /><span>{label}</span>{label === 'Notifications' && <span className="nav-dot" />}</Link>)}</nav>
      <div className="sidebar-foot"><div className="help-note"><Phone size={16} /><div><strong>Need help?</strong><span>1800 123 7400</span></div></div><button className="side-logout" onClick={signOut} data-testid="button-logout"><LogOut size={16} /> Sign out</button><span className="version">KrishiSetu · v1.0</span></div>
    </aside>
    {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <main className="main-column">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="topbar-trail"><span>{admin ? 'Operations desk' : 'Namaste, '}</span><strong>{admin ? 'Today’s procurement pulse' : user?.name || 'Farmer'}</strong></div><div className="topbar-actions"><Link href={admin ? '/admin' : '/farmer/notifications'} className="icon-button" data-testid="link-header-notifications"><Bell size={18} /><span className="notification-pip" /></Link><div className="avatar" data-testid="text-user-initials">{initials(user?.name)}</div></div></header>
      <div className="content">{children}</div>
    </main>
  </div>;
}

function Landing() {
  return <div className="landing paper-grid">
    <header className="landing-nav"><Logo /><div className="landing-actions"><Link href="/login" className="text-link" data-testid="link-login">Sign in <LogIn size={15} /></Link><Link href="/register" className="ks-button ks-button-primary" data-testid="link-register">Join as a farmer <ArrowRight size={16} /></Link></div></header>
    <section className="hero landing-wrap"><div className="hero-copy animate-rise"><div className="heritage-line"><span /><span>PUBLIC PROCUREMENT, MADE HUMAN</span></div><h1 className="font-display">Your harvest.<br /><em>Your place in line.</em></h1><p className="hero-lede">KrishiSetu is a calm, clear bridge to government procurement — from a slot you can trust to payment you can see.</p><div className="hero-actions"><Link href="/register" className="ks-button ks-button-primary" data-testid="link-hero-register">Start with your harvest <ArrowRight size={17} /></Link><Link href="/login" className="text-link text-link-dark" data-testid="link-hero-login">I already have an account <ChevronRight size={16} /></Link></div><div className="trust-row"><span><ShieldCheck size={17} /> Government procurement</span><span><Phone size={17} /> Simple mobile access</span></div></div><div className="hero-art animate-rise animate-delay-1"><div className="sun-disc" /><div className="field-lines" /><div className="hero-card"><span className="eyebrow">TODAY’S FIELD NOTE</span><div className="hero-card-row"><div className="hero-icon"><Ticket size={22} /></div><div><strong>Token <span className="font-mono-app">KS-047</span></strong><small>Sehore Centre · 10:30 AM</small></div><Badge tone="green">Confirmed</Badge></div><div className="mini-progress"><span /><span /><span /><span className="pending" /></div><small className="muted">You are 3rd in the queue</small></div><div className="art-label art-label-one"><span>01</span><strong>Reserve</strong><small>your time</small></div><div className="art-label art-label-two"><span>02</span><strong>Arrive</strong><small>without the wait</small></div></div></section>
    <section className="promise-strip"><div><span className="strip-number">01</span><span><strong>A visible token</strong><small>No more guessing when your turn comes.</small></span></div><div><span className="strip-number">02</span><span><strong>A living queue</strong><small>See movement from your own phone.</small></span></div><div><span className="strip-number">03</span><span><strong>Payment, accounted for</strong><small>Every kilogram. Every rupee. Recorded.</small></span></div></section>
    <section className="landing-story landing-wrap"><div className="story-aside"><span className="eyebrow">THE SETU PROMISE</span><h2 className="font-display">A little more certainty, at every step.</h2></div><div className="story-list"><div><span className="story-index">01</span><div><h3>Choose a time that fits the farm</h3><p>Browse nearby procurement centres and open slots before you load the trolley.</p></div></div><div><span className="story-index">02</span><div><h3>Carry one clear token</h3><p>Your booking, crop and expected quantity stay together in one simple record.</p></div></div><div><span className="story-index">03</span><div><h3>Watch the work become payment</h3><p>Checked in, weighed, verified, paid. A progress story you can follow.</p></div></div></div></section>
    <footer className="landing-footer landing-wrap"><Logo /><span>Built for the people who feed India.</span><span className="footer-rule" /><span>Smart India Hackathon · 2026</span></footer>
  </div>;
}

function AuthCard({ mode }: { mode: 'login' | 'register' }) {
  const [, setLocation] = useLocation();
  const login = useLogin();
  const register = useRegisterFarmer();
  const [role, setRole] = useState<'farmer' | 'admin'>('farmer');
  const [form, setForm] = useState({ name: '', phone: '', village: '', username: '', password: '' });
  const [error, setError] = useState('');
  const isLogin = mode === 'login';
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((old) => ({ ...old, [key]: event.target.value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (isLogin) login.mutate({ data: { username: form.username, password: form.password, role } }, { onSuccess: () => setLocation(role === 'admin' ? '/admin' : '/farmer'), onError: () => setError('Those details did not match. Try the demo access below.') });
    else register.mutate({ data: { name: form.name, phone: form.phone, village: form.village, password: form.password } }, { onSuccess: () => setLocation('/farmer'), onError: () => setError('Registration could not be completed. Please check your details.') });
  };
  return <div className="auth-page paper-grid"><header className="landing-nav"><Logo /><Link href="/" className="text-link" data-testid="link-auth-home">Back to home <ArrowRight size={15} /></Link></header><div className="auth-layout"><div className="auth-intro"><span className="eyebrow">KRISHISETU / {isLogin ? 'WELCOME BACK' : 'FIRST HARVEST'}</span><h1 className="font-display">{isLogin ? <>Good to see<br /><em>you again.</em></> : <>Let’s put your<br /><em>harvest on record.</em></>}</h1><p>{isLogin ? 'Pick up where you left off. Your token and progress are waiting.' : 'A simple account is all it takes to find a fair, visible place in the queue.'}</p></div><div className="auth-card"><div className="auth-card-head"><Mark /><span>{isLogin ? 'Sign in to KrishiSetu' : 'Create your farmer account'}</span></div>{isLogin && <div className="role-switch"><button className={role === 'farmer' ? 'selected' : ''} onClick={() => setRole('farmer')} type="button" data-testid="button-role-farmer"><Sprout size={15} /> Farmer</button><button className={role === 'admin' ? 'selected' : ''} onClick={() => setRole('admin')} type="button" data-testid="button-role-admin"><ShieldCheck size={15} /> Centre admin</button></div>}<form onSubmit={submit}>{!isLogin && <><label>Full name<input required minLength={2} value={form.name} onChange={update('name')} placeholder="e.g. Meera Patel" data-testid="input-name" /></label><label>Mobile number<input required minLength={10} maxLength={10} inputMode="numeric" pattern="[0-9]{10}" value={form.phone} onChange={update('phone')} placeholder="10-digit mobile number" data-testid="input-phone" /></label><label>Village<input required minLength={2} value={form.village} onChange={update('village')} placeholder="Your village or block" data-testid="input-village" /></label></>}<label>{isLogin ? 'Email or mobile number' : 'Create a password'}<input required minLength={isLogin ? 1 : 8} type={isLogin ? 'text' : 'password'} value={isLogin ? form.username : form.password} onChange={update(isLogin ? 'username' : 'password')} placeholder={isLogin ? 'you@example.in' : 'At least 8 characters'} data-testid={`input-${isLogin ? 'username' : 'password'}`} /></label>{isLogin && <label>Password<input required type="password" value={form.password} onChange={update('password')} placeholder="Your password" data-testid="input-password" /></label>} {error && <p className="form-error" data-testid="status-auth-error">{error}</p>}<Button type="submit" disabled={login.isPending || register.isPending} data-testid="button-submit-auth">{login.isPending || register.isPending ? 'One moment…' : isLogin ? 'Open my space' : 'Create my account'} <ArrowRight size={16} /></Button></form>{isLogin ? <div className="demo-box"><span>Demo access</span><strong>{role === 'admin' ? 'admin@krishisetu.in' : 'farmer@krishisetu.in'}</strong><small>{role === 'admin' ? 'admin123' : 'farmer123'} · use the role above</small></div> : <p className="auth-switch">Already registered? <Link href="/login" data-testid="link-auth-login">Sign in</Link></p>} {isLogin && <p className="auth-switch">New to KrishiSetu? <Link href="/register" data-testid="link-auth-register">Create an account</Link></p>}</div></div></div>;
}

function FarmerDashboard() {
  const current = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false } });
  const dashboard = useGetFarmerDashboard({ query: { queryKey: getGetFarmerDashboardQueryKey(), retry: false, refetchInterval: 3000, refetchIntervalInBackground: true } });
  const cancel = useCancelBooking();
  const [, setLocation] = useLocation();
  const user = current.data || dashboard.data?.user;
  if (dashboard.isLoading) return <AppShell user={user}><LoadingBlock /></AppShell>;
  if (dashboard.isError) return <AppShell user={user}><ErrorBlock retry={() => dashboard.refetch()} /></AppShell>;
  const data = dashboard.data;
  const booking = data?.activeBooking;
  return <AppShell user={user}><PageHeading eyebrow="FARMER SPACE / OVERVIEW" title={`Good morning, ${user?.name?.split(' ')[0] || 'farmer'}.`} detail="Here’s the shape of your procurement day." action={<Link href="/farmer/book" className="ks-button ks-button-primary" data-testid="link-book-slot"><Plus size={16} /> Book a slot</Link>} /><div className="dashboard-grid">{booking ? <section className="feature-card token-overview"><div className="feature-top"><div><span className="eyebrow">LATEST BOOKING</span><h2 className="font-display">{booking.status === 'Completed' ? 'Your payment is recorded.' : booking.status === 'Procured' ? 'Your harvest is recorded.' : 'Your turn is held.'}</h2></div><Badge tone={booking.status === 'Cancelled' ? 'red' : 'green'}>{booking.status}</Badge></div><div className="token-big"><span>Token</span><strong className="font-mono-app" data-testid="text-active-token">{booking.token}</strong><small>{booking.queuePosition ? `Position ${booking.queuePosition} in today’s queue` : 'Queue position will appear shortly'}</small></div><div className="booking-meta"><div><MapPin size={16} /><span><small>Centre</small><strong>{booking.centreName}</strong></span></div><div><CalendarDays size={16} /><span><small>Date</small><strong>{fmtDate(booking.date)}</strong></span></div><div><Clock3 size={16} /><span><small>Arrival window</small><strong>{booking.startTime} – {booking.endTime}</strong></span></div></div><div className="feature-actions"><Link href={booking.status === 'Completed' || booking.status === 'Procured' ? '/farmer/track' : '/farmer/token'} className="ks-button ks-button-primary" data-testid="link-view-token">{booking.status === 'Completed' ? 'View payment' : booking.status === 'Procured' ? 'View procurement' : 'View token'} <ArrowRight size={15} /></Link>{!['Procured', 'Completed', 'Cancelled'].includes(booking.status) && <button className="text-button danger" disabled={cancel.isPending} onClick={() => { if (window.confirm('Cancel this booking?')) cancel.mutate({ id: booking.id }, { onSuccess: () => dashboard.refetch() }); }} data-testid="button-cancel-booking">Cancel booking</button>}</div></section> : <section className="feature-card empty-booking"><div className="empty-seal"><Ticket size={24} /></div><span className="eyebrow">NO ACTIVE BOOKING</span><h2 className="font-display">Your next turn<br />starts here.</h2><p>Choose an open slot at a centre near you and receive a clear token.</p><Link href="/farmer/book" className="ks-button ks-button-primary" data-testid="link-empty-book-slot">Find a slot <ArrowRight size={15} /></Link></section>}<section className="side-stack"><div className="metric-card"><div className="metric-head"><span>Next available</span><CalendarDays size={17} /></div>{data?.upcomingSlots?.[0] ? <><strong>{fmtDate(data.upcomingSlots[0].date)}</strong><p>{data.upcomingSlots[0].centreName} · {data.upcomingSlots[0].available} places left</p></> : <><strong>Not listed yet</strong><p>New slots will appear here.</p></>}</div><div className="metric-card green-wash"><div className="metric-head"><span>Notifications</span><Bell size={17} /></div><strong>{data?.notifications?.length || 0} <small>updates</small></strong><Link href="/farmer/notifications" className="inline-link" data-testid="link-dashboard-notifications">Read updates <ArrowRight size={14} /></Link></div></section></div><section className="section-block"><div className="section-title"><div><span className="eyebrow">WHAT HAPPENS NEXT</span><h2 className="font-display">Your procurement story</h2></div>{booking && <Link href="/farmer/track" className="text-link text-link-dark" data-testid="link-dashboard-track">See full tracking <ArrowRight size={15} /></Link>}</div><ProgressStory booking={booking} /></section></AppShell>;
}

function ProgressStory({ booking }: { booking?: Booking | null }) {
  const current = booking?.status || 'Booked';
  const steps = ['Booked', 'Checked In', 'Verification', 'Procured', 'Completed'];
  const index = steps.indexOf(current);
  return <div className="story-progress" data-testid="status-procurement-story">{steps.map((step, i) => <div className={`progress-step ${i <= index ? 'done' : ''}`} key={step}><div className="step-dot">{i <= index ? <Check size={13} /> : <span>{i + 1}</span>}</div><span>{step}</span>{i < steps.length - 1 && <div className={`step-rail ${i < index ? 'filled' : ''}`} />}</div>)}</div>;
}

function BookSlot() {
  const current = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false } });
  const centres = useListCentres({ query: { queryKey: getListCentresQueryKey(), retry: false } });
  const [centreId, setCentreId] = useState<number>();
  const slots = useListSlots(centreId ? { centreId } : undefined, { query: { queryKey: getListSlotsQueryKey(centreId ? { centreId } : undefined), enabled: !!centreId, retry: false } });
  const create = useCreateBooking();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ crop: '', expectedQuantity: '', harvestDate: '' });
  const [selected, setSelected] = useState<Slot>();
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!selected) return setError('Choose an open time first.'); setError(''); create.mutate({ data: { slotId: selected.id, crop: form.crop, expectedQuantity: Number(form.expectedQuantity), harvestDate: form.harvestDate } }, { onSuccess: () => setLocation('/farmer/token'), onError: () => setError('That slot may have just filled. Please choose another.') }); };
  return <AppShell user={current.data}><PageHeading eyebrow="FARMER SPACE / NEW BOOKING" title="Make a plan for your harvest." detail="Tell us what is coming in. We’ll hold a time at the centre." /><div className="booking-layout"><form className="form-panel" onSubmit={submit}><div className="form-section"><span className="form-step">01 / YOUR HARVEST</span><div className="field-grid"><label>Crop<input required value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} placeholder="e.g. Soybean" data-testid="input-booking-crop" /></label><label>Expected quantity (kg)<input required type="number" min="1" value={form.expectedQuantity} onChange={(e) => setForm({ ...form, expectedQuantity: e.target.value })} placeholder="e.g. 850" data-testid="input-booking-quantity" /></label></div><label>Expected harvest date<input required type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} data-testid="input-booking-harvest-date" /></label></div><div className="form-section"><span className="form-step">02 / CHOOSE A CENTRE</span><select required value={centreId || ''} onChange={(e) => { setCentreId(Number(e.target.value)); setSelected(undefined); }} data-testid="select-booking-centre"><option value="">Select a nearby centre</option>{centres.data?.map((centre) => <option value={centre.id} key={centre.id}>{centre.name} · {centre.village}</option>)}</select>{centres.isLoading && <p className="field-note">Finding centres near you…</p>}{centres.isError && <p className="form-error">Centres could not load. Try again.</p>}</div><div className="form-section"><span className="form-step">03 / HOLD YOUR TIME</span>{!centreId ? <div className="slot-placeholder"><CalendarDays size={19} /><span>Select a centre to see open times.</span></div> : slots.isLoading ? <div className="slot-placeholder"><Clock3 size={19} /><span>Checking open times…</span></div> : slots.data?.length ? <div className="slot-grid">{slots.data.map((slot) => <button type="button" key={slot.id} disabled={slot.available < 1} onClick={() => setSelected(slot)} className={`slot-option ${selected?.id === slot.id ? 'slot-selected' : ''}`} data-testid={`button-slot-${slot.id}`}><strong>{slot.startTime} – {slot.endTime}</strong><span>{slot.available} places left</span>{selected?.id === slot.id && <Check size={15} />}</button>)}</div> : <div className="slot-placeholder"><Clock3 size={19} /><span>No slots are open at this centre yet.</span></div>}</div>{error && <p className="form-error" data-testid="status-booking-error">{error}</p>}<Button type="submit" disabled={create.isPending || !selected} data-testid="button-confirm-booking">{create.isPending ? 'Holding your place…' : 'Confirm booking'} <ArrowRight size={16} /></Button></form><aside className="booking-aside"><div className="aside-stamp"><Sprout size={20} /><span>SETU NOTE</span></div><h3 className="font-display">A good day at the mandi begins with a clear plan.</h3><p>Arrive with your token, crop details and harvest estimate ready. We’ll keep the queue moving.</p><div className="aside-rule" /><div className="aside-detail"><MapPin size={15} /><span>Centres are shown by proximity to your village.</span></div><div className="aside-detail"><ShieldCheck size={15} /><span>Your booking is recorded with the public procurement centre.</span></div></aside></div></AppShell>;
}

function TokenPage() {
  const dashboard = useGetFarmerDashboard({ query: { queryKey: getGetFarmerDashboardQueryKey(), retry: false, refetchInterval: 3000, refetchIntervalInBackground: true } });
  const booking = dashboard.data?.activeBooking;
  const detail = useGetBooking(booking?.id || 0, { query: { enabled: !!booking?.id, queryKey: getGetBookingQueryKey(booking?.id || 0), retry: false } });
  const peopleAhead = Math.max(0, (booking?.queuePosition || 1) - 1);
  return <AppShell user={dashboard.data?.user}><PageHeading eyebrow="FARMER SPACE / MY TOKEN" title="One token. One clear turn." detail="Keep this page open when you travel to the centre." /><div className="token-layout">{booking ? <><section className="ticket-card"><div className="ticket-notch left" /><div className="ticket-notch right" /><div className="ticket-top"><span className="eyebrow">KRISHISETU TOKEN</span><Badge tone="green">{booking.status}</Badge></div><strong className="ticket-number font-mono-app" data-testid="text-token-number">{booking.token}</strong><span className="ticket-caption">Queue position {booking.queuePosition || '—'}</span><div className="ticket-divider" /><div className="ticket-info"><span><small>PROCUREMENT CENTRE</small><strong>{booking.centreName}</strong></span><span><small>DATE</small><strong>{fmtDate(booking.date)}</strong></span><span><small>ARRIVAL WINDOW</small><strong>{booking.startTime} – {booking.endTime}</strong></span></div><Link href="/farmer/track" className="ks-button ks-button-primary ticket-button" data-testid="link-token-track">Track procurement <ArrowRight size={15} /></Link></section><section className="queue-panel"><div className="section-title"><div><span className="eyebrow">LIVE QUEUE</span><h2 className="font-display">Your place is visible.</h2></div><span className="live-indicator"><i /> LIVE</span></div><div className="queue-number"><strong>{booking.queuePosition || '—'}</strong><span>{peopleAhead === 0 ? 'You are next in line' : `${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead of you`}</span></div><div className="queue-track"><span style={{ width: `${Math.max(18, Math.min(84, 100 - (booking.queuePosition || 3) * 8))}%` }} /></div><p className="queue-note"><Clock3 size={16} /> Queue movement is updated by the centre team.</p><div className="detail-list"><div><span>Crop</span><strong>{booking.crop}</strong></div><div><span>Expected quantity</span><strong>{booking.expectedQuantity} kg</strong></div><div><span>Token details</span><button className="inline-link" onClick={() => detail.refetch()} data-testid="button-refresh-token">Refresh <RefreshCw size={13} /></button></div></div></section></> : <EmptyBlock title="No token yet" detail="Book an open slot to receive your place in the queue." action={<Link href="/farmer/book" className="ks-button ks-button-primary" data-testid="link-token-book">Find an open slot <ArrowRight size={15} /></Link>} />}</div></AppShell>;
}

function TrackPage() {
  const dashboard = useGetFarmerDashboard({ query: { queryKey: getGetFarmerDashboardQueryKey(), retry: false, refetchInterval: 3000, refetchIntervalInBackground: true } });
  const booking = dashboard.data?.activeBooking;
  return <AppShell user={dashboard.data?.user}><PageHeading eyebrow="FARMER SPACE / TRACKING" title="From grain to payment." detail="A simple record of where your harvest stands." />{booking ? <div className="track-layout"><section className="track-main"><div className="section-title"><div><span className="eyebrow">CURRENT STATUS</span><h2 className="font-display">{booking.status === 'Completed' ? 'Procurement complete.' : 'Your harvest is moving.'}</h2></div><Badge tone={booking.status === 'Completed' ? 'green' : 'gold'}>{booking.status}</Badge></div><ProgressStory booking={booking} /><div className="track-facts"><div><PackageCheck size={19} /><span><small>Recorded crop</small><strong>{booking.crop} · {booking.expectedQuantity} kg expected</strong></span></div><div><IndianRupee size={19} /><span><small>Payment status</small><strong>{booking.paymentStatus}</strong></span></div></div></section><aside className="payment-card"><span className="eyebrow">PAYMENT LEDGER</span><div className="payment-amount">{money(booking.totalAmount)}</div><p>{booking.totalAmount ? `For ${booking.actualQuantity || booking.expectedQuantity} kg at ${money(booking.pricePerKg)}/kg` : 'Amount appears after weighing and verification.'}</p><div className="ledger-line"><span>Booking date</span><strong>{fmtDate(booking.date)}</strong></div><div className="ledger-line"><span>Token</span><strong className="font-mono-app">{booking.token}</strong></div><div className="payment-status"><span className={`status-pulse ${booking.paymentStatus === 'Paid' ? 'pulse-green' : ''}`} /> {booking.paymentStatus}</div></aside></div> : <EmptyBlock title="Your progress story starts with a booking" detail="Once you have a token, every handoff will be recorded here." action={<Link href="/farmer/book" className="ks-button ks-button-primary" data-testid="link-track-book">Book a slot <ArrowRight size={15} /></Link>} />}</AppShell>;
}

function NotificationsPage() {
  const current = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false } });
  const notifications = useListNotifications({ query: { queryKey: getListNotificationsQueryKey(), retry: false, refetchInterval: 3000, refetchIntervalInBackground: true } });
  return <AppShell user={current.data}><PageHeading eyebrow="FARMER SPACE / INBOX" title="Notes from the Setu." detail="Important updates stay here, in plain words." />{notifications.isLoading ? <LoadingBlock label="Looking for your latest notes…" /> : notifications.isError ? <ErrorBlock retry={() => notifications.refetch()} /> : notifications.data?.length ? <div className="notification-list">{notifications.data.map((item) => <article className={`notification-item ${item.read ? '' : 'unread'}`} key={item.id} data-testid={`card-notification-${item.id}`}><div className="notification-symbol"><Bell size={17} /></div><div><div className="notification-title"><h3>{item.title}</h3>{!item.read && <span className="unread-dot" />}</div><p>{item.message}</p><time>{fmtDate(item.createdAt)}</time></div></article>)}</div> : <EmptyBlock title="No new notes" detail="When your booking or payment changes, we’ll leave a note here." />}</AppShell>;
}

function AdminDashboard() {
  const current = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false } });
  const summary = useGetAdminSummary({ query: { queryKey: getGetAdminSummaryQueryKey(), retry: false } });
  const bookings = useListBookings(undefined, { query: { queryKey: getListBookingsQueryKey(), retry: false } });
  const metrics = summary.data;
  return <AppShell user={current.data} admin><PageHeading eyebrow="OPERATIONS / TODAY" title="Keep the queue moving." detail="A live read of procurement across your centres." action={<Link href="/admin/manage" className="ks-button ks-button-primary" data-testid="link-admin-manage"><Plus size={16} /> Add a slot</Link>} />{summary.isLoading ? <LoadingBlock label="Loading today’s operations…" /> : summary.isError ? <ErrorBlock retry={() => summary.refetch()} /> : <><div className="admin-metrics"><Metric icon={Users} label="Registered farmers" value={metrics?.totalFarmers} accent="indigo" /><Metric icon={CalendarDays} label="Today’s bookings" value={metrics?.todaysBookings} accent="gold" /><Metric icon={Clock3} label="Waiting now" value={metrics?.waitingFarmers} accent="green" /><Metric icon={PackageCheck} label="Completed" value={metrics?.completedProcurements} accent="maroon" /><Metric icon={IndianRupee} label="Pending payments" value={metrics?.pendingPayments} accent="slate" /></div><section className="admin-queue"><div className="section-title"><div><span className="eyebrow">LIVE OPERATIONS</span><h2 className="font-display">Today’s queue</h2></div><Link href="/admin/manage" className="text-link text-link-dark" data-testid="link-manage-queue">Manage queue <ArrowRight size={15} /></Link></div>{bookings.isLoading ? <LoadingBlock /> : bookings.data?.length ? <div className="table-wrap"><table><thead><tr><th>Token</th><th>Farmer</th><th>Crop</th><th>Window</th><th>Status</th><th>Payment</th></tr></thead><tbody>{bookings.data.slice(0, 8).map((booking) => <tr key={booking.id} data-testid={`row-admin-booking-${booking.id}`}><td className="font-mono-app">{booking.token}</td><td><strong>{booking.farmerName}</strong><small>{booking.farmerId}</small></td><td>{booking.crop}</td><td>{booking.startTime} – {booking.endTime}</td><td><Badge tone={booking.status === 'Completed' ? 'green' : booking.status === 'Cancelled' ? 'red' : 'gold'}>{booking.status}</Badge></td><td>{booking.paymentStatus}</td></tr>)}</tbody></table></div> : <EmptyBlock title="The queue is clear" detail="Bookings will appear here as farmers reserve their times." />}</section></>}</AppShell>;
}

function Metric({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value?: number; accent: string }) {
  return <div className={`admin-metric metric-${accent}`} data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="metric-icon"><Icon size={18} /></div><span>{label}</span><strong>{value ?? '—'}</strong></div>;
}

function AdminManage() {
  const current = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false } });
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const farmers = useListFarmers(search ? { search } : undefined, { query: { queryKey: getListFarmersQueryKey(search ? { search } : undefined), retry: false } });
  const centres = useListCentres({ query: { queryKey: getListCentresQueryKey(), retry: false } });
  const bookings = useListBookings(undefined, { query: { queryKey: getListBookingsQueryKey(), retry: false } });
  const createCentre = useCreateCentre();
  const createSlot = useCreateSlot();
  const updateStatus = useUpdateBookingStatus();
  const [tab, setTab] = useState<'farmers' | 'bookings' | 'centres'>('bookings');
  const [showCentre, setShowCentre] = useState(false);
  const [showSlot, setShowSlot] = useState(false);
  const [centreForm, setCentreForm] = useState({ name: '', village: '', address: '', openTime: '08:00', closeTime: '17:00' });
  const [slotForm, setSlotForm] = useState({ centreId: '', date: '', startTime: '09:00', endTime: '10:00', capacity: '25' });
  const [settlementBooking, setSettlementBooking] = useState<Booking>();
  const [settlementForm, setSettlementForm] = useState({ actualQuantity: '', pricePerKg: '' });
  const submitCentre = (e: React.FormEvent) => { e.preventDefault(); createCentre.mutate({ data: centreForm }, { onSuccess: () => { setShowCentre(false); centres.refetch(); } }); };
  const refreshOperations = () => {
    bookings.refetch();
    farmers.refetch();
    client.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
  };
  const submitSlot = (e: React.FormEvent) => { e.preventDefault(); createSlot.mutate({ data: { centreId: Number(slotForm.centreId), date: slotForm.date, startTime: slotForm.startTime, endTime: slotForm.endTime, capacity: Number(slotForm.capacity) } }, { onSuccess: () => { setShowSlot(false); centres.refetch(); } }); };
  const advanceBooking = (booking: Booking, status: 'Checked In' | 'Verification' | 'Completed', paymentStatus = booking.paymentStatus) => {
    updateStatus.mutate({ id: booking.id, data: { status, paymentStatus, actualQuantity: booking.actualQuantity, pricePerKg: booking.pricePerKg } }, { onSuccess: refreshOperations });
  };
  const openSettlement = (booking: Booking) => {
    setSettlementBooking(booking);
    setSettlementForm({ actualQuantity: String(booking.actualQuantity || booking.expectedQuantity), pricePerKg: booking.pricePerKg ? String(booking.pricePerKg) : '' });
  };
  const submitSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementBooking) return;
    updateStatus.mutate({ id: settlementBooking.id, data: { status: 'Procured', paymentStatus: 'Processing', actualQuantity: Number(settlementForm.actualQuantity), pricePerKg: Number(settlementForm.pricePerKg) } }, { onSuccess: () => { setSettlementBooking(undefined); refreshOperations(); } });
  };
  const estimatedTotal = Number(settlementForm.actualQuantity || 0) * Number(settlementForm.pricePerKg || 0);
  return <AppShell user={current.data} admin><PageHeading eyebrow="OPERATIONS / MANAGEMENT" title="Make room for the harvest." detail="Farmers, bookings and centres in one working view." action={<div className="heading-actions"><Button variant="outline" onClick={() => setShowCentre(true)} data-testid="button-add-centre"><Plus size={15} /> Centre</Button><Button onClick={() => setShowSlot(true)} data-testid="button-add-slot"><Plus size={15} /> Slot</Button></div>} /><div className="manage-tabs"><button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')} data-testid="button-tab-bookings">Bookings</button><button className={tab === 'farmers' ? 'active' : ''} onClick={() => setTab('farmers')} data-testid="button-tab-farmers">Farmers</button><button className={tab === 'centres' ? 'active' : ''} onClick={() => setTab('centres')} data-testid="button-tab-centres">Centres</button></div>{tab === 'farmers' && <section className="manage-panel"><div className="search-field"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID or village" data-testid="input-search-farmers" /></div>{farmers.isLoading ? <LoadingBlock /> : farmers.data?.length ? <div className="table-wrap"><table><thead><tr><th>Farmer</th><th>Farmer ID</th><th>Village</th><th>Crop</th><th>Harvest date</th></tr></thead><tbody>{farmers.data.map((farmer) => <tr key={farmer.id} data-testid={`row-farmer-${farmer.id}`}><td><strong>{farmer.name}</strong><small>{farmer.phone}</small></td><td className="font-mono-app">{farmer.farmerId || '—'}</td><td>{farmer.village}</td><td>{farmer.crop || '—'}</td><td>{fmtDate(farmer.harvestDate)}</td></tr>)}</tbody></table></div> : <EmptyBlock title="No farmers found" detail="Try a different name or village." />}</section>}{tab === 'bookings' && <section className="manage-panel"><div className="panel-heading"><div><span className="eyebrow">BOOKING REGISTER</span><h2 className="font-display">Update today’s handoffs</h2></div></div>{bookings.isLoading ? <LoadingBlock /> : bookings.data?.length ? <div className="table-wrap"><table><thead><tr><th>Farmer</th><th>Token</th><th>Queue</th><th>Status</th><th>Action</th></tr></thead><tbody>{bookings.data.map((booking) => <BookingRow key={booking.id} booking={booking} onUpdate={(status, paymentStatus) => advanceBooking(booking, status, paymentStatus)} onRecord={() => openSettlement(booking)} />)}</tbody></table></div> : <EmptyBlock title="No bookings to manage" detail="The register will populate when farmers book a slot." />}</section>}{tab === 'centres' && <section className="manage-panel"><div className="centre-grid">{centres.isLoading ? <LoadingBlock /> : centres.data?.length ? centres.data.map((centre) => <div className="centre-card" key={centre.id}><div className="centre-pin"><MapPin size={17} /></div><span className="eyebrow">CENTRE {String(centre.id).padStart(2, '0')}</span><h3>{centre.name}</h3><p>{centre.address}, {centre.village}</p><span className="centre-hours"><Clock3 size={14} /> {centre.openTime} – {centre.closeTime}</span></div>) : <EmptyBlock title="No centres yet" detail="Add the first public procurement centre." action={<Button onClick={() => setShowCentre(true)} data-testid="button-empty-add-centre"><Plus size={15} /> Add centre</Button>} />}</div></section>}{showCentre && <Modal title="Add procurement centre" close={() => setShowCentre(false)}><form onSubmit={submitCentre} className="modal-form">{(['name', 'village', 'address'] as const).map((key) => <label key={key}>{key === 'name' ? 'Centre name' : key[0].toUpperCase() + key.slice(1)}<input required value={centreForm[key]} onChange={(e) => setCentreForm({ ...centreForm, [key]: e.target.value })} data-testid={`input-centre-${key}`} /></label>)}<div className="field-grid"><label>Opens<input type="time" value={centreForm.openTime} onChange={(e) => setCentreForm({ ...centreForm, openTime: e.target.value })} data-testid="input-centre-open" /></label><label>Closes<input type="time" value={centreForm.closeTime} onChange={(e) => setCentreForm({ ...centreForm, closeTime: e.target.value })} data-testid="input-centre-close" /></label></div><Button type="submit" disabled={createCentre.isPending} data-testid="button-submit-centre">{createCentre.isPending ? 'Saving…' : 'Save centre'} <Check size={15} /></Button></form></Modal>}{showSlot && <Modal title="Open a new slot" close={() => setShowSlot(false)}><form onSubmit={submitSlot} className="modal-form"><label>Centre<select required value={slotForm.centreId} onChange={(e) => setSlotForm({ ...slotForm, centreId: e.target.value })} data-testid="select-slot-centre"><option value="">Choose a centre</option>{centres.data?.map((centre) => <option key={centre.id} value={centre.id}>{centre.name}</option>)}</select></label><label>Date<input required type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} data-testid="input-slot-date" /></label><div className="field-grid"><label>Starts<input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} data-testid="input-slot-start" /></label><label>Ends<input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} data-testid="input-slot-end" /></label></div><label>Capacity<input required type="number" min="1" value={slotForm.capacity} onChange={(e) => setSlotForm({ ...slotForm, capacity: e.target.value })} data-testid="input-slot-capacity" /></label><Button type="submit" disabled={createSlot.isPending} data-testid="button-submit-slot">{createSlot.isPending ? 'Opening…' : 'Open slot'} <Check size={15} /></Button></form></Modal>}{settlementBooking && <Modal title="Record procurement" close={() => setSettlementBooking(undefined)}><form onSubmit={submitSettlement} className="modal-form"><p className="field-note">Token {settlementBooking.token} · {settlementBooking.farmerName} · {settlementBooking.crop}</p><div className="field-grid"><label>Actual quantity (kg)<input required type="number" min="1" step="0.01" value={settlementForm.actualQuantity} onChange={(e) => setSettlementForm({ ...settlementForm, actualQuantity: e.target.value })} data-testid="input-procurement-quantity" /></label><label>Price per kg (₹)<input required type="number" min="0.01" step="0.01" value={settlementForm.pricePerKg} onChange={(e) => setSettlementForm({ ...settlementForm, pricePerKg: e.target.value })} data-testid="input-procurement-price" /></label></div><p className="field-note">Calculated amount: <strong>{money(estimatedTotal)}</strong></p><Button type="submit" disabled={updateStatus.isPending} data-testid="button-submit-procurement">{updateStatus.isPending ? 'Recording…' : 'Record procurement'} <Check size={15} /></Button></form></Modal>}</AppShell>;
}

function BookingRow({ booking, onUpdate, onRecord }: { booking: Booking; onUpdate: (status: 'Checked In' | 'Verification' | 'Completed', paymentStatus?: 'Pending' | 'Processing' | 'Paid') => void; onRecord: () => void }) {
  let action: ReactNode = <span className="muted">Complete</span>;
  if (booking.status === 'Booked') action = <Button variant="quiet" onClick={() => onUpdate('Checked In')} data-testid={`button-advance-booking-${booking.id}`}>Mark Checked In <ChevronRight size={14} /></Button>;
  if (booking.status === 'Checked In') action = <Button variant="quiet" onClick={() => onUpdate('Verification')} data-testid={`button-advance-booking-${booking.id}`}>Mark Verification <ChevronRight size={14} /></Button>;
  if (booking.status === 'Verification') action = <Button variant="quiet" onClick={onRecord} data-testid={`button-record-booking-${booking.id}`}>Record procurement <ChevronRight size={14} /></Button>;
  if (booking.status === 'Procured') action = <Button variant="quiet" onClick={() => onUpdate('Completed', 'Paid')} data-testid={`button-complete-booking-${booking.id}`}>Complete & mark paid <ChevronRight size={14} /></Button>;
  return <tr data-testid={`row-manage-booking-${booking.id}`}><td><strong>{booking.farmerName}</strong><small>{booking.crop} · {booking.expectedQuantity} kg</small></td><td className="font-mono-app">{booking.token}</td><td>{booking.queuePosition || '—'}</td><td><Badge tone={booking.status === 'Completed' ? 'green' : booking.status === 'Cancelled' ? 'red' : 'gold'}>{booking.status}</Badge></td><td>{action}</td></tr>;
}

function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" role="dialog"><div className="modal"><div className="modal-head"><div><span className="eyebrow">OPERATIONS DESK</span><h2 className="font-display">{title}</h2></div><button className="icon-button" onClick={close} aria-label="Close dialog" data-testid="button-close-modal"><X size={18} /></button></div>{children}</div></div>;
}

function AuthGate({ children, role }: { children: ReactNode; role: 'farmer' | 'admin' }) {
  const current = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false } });
  const [, setLocation] = useLocation();
  if (current.isLoading) return <LoadingBlock label="Opening your secure space…" />;
  if (current.data && current.data.role === role) return <>{children}</>;
  return <div className="route-gate"><ShieldCheck size={22} /><h2 className="font-display">This space needs a sign in.</h2><p>Use the demo account or your KrishiSetu details to continue.</p><Link href="/login" className="ks-button ks-button-primary" data-testid="link-gate-login">Go to sign in <ArrowRight size={15} /></Link></div>;
}

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={Landing} /><Route path="/login"><AuthCard mode="login" /></Route><Route path="/register"><AuthCard mode="register" /></Route><Route path="/farmer"><AuthGate role="farmer"><FarmerDashboard /></AuthGate></Route><Route path="/farmer/book"><AuthGate role="farmer"><BookSlot /></AuthGate></Route><Route path="/farmer/token"><AuthGate role="farmer"><TokenPage /></AuthGate></Route><Route path="/farmer/track"><AuthGate role="farmer"><TrackPage /></AuthGate></Route><Route path="/farmer/notifications"><AuthGate role="farmer"><NotificationsPage /></AuthGate></Route><Route path="/admin"><AuthGate role="admin"><AdminDashboard /></AuthGate></Route><Route path="/admin/manage"><AuthGate role="admin"><AdminManage /></AuthGate></Route><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
