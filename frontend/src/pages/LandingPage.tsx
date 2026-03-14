import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { 
  Globe, 
  Database, 
  Cpu, 
  Lock, 
  ChevronRight,
  Code2,
  Sparkles,
  Zap
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth(); // Destructure auth state

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      
      {/* Decorative Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]" />

      {/* Floating Pill Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-between w-full max-w-4xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 shadow-2xl">
          <div className="flex items-center gap-2 pl-2">
            <Code2 className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-lg tracking-tight text-white">KodeBox</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Dynamic Navbar Buttons */}
            {!loading && (
              isAuthenticated ? (
                <Link to="/dashboard" className="text-sm font-semibold bg-emerald-500 text-black hover:bg-emerald-400 px-5 py-2 rounded-full transition-transform active:scale-95 flex items-center gap-1">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/signin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-white/5">
                    Sign In
                  </Link>
                  <Link to="/signup" className="text-sm font-semibold bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-full transition-transform active:scale-95 flex items-center gap-1">
                    Start Coding
                  </Link>
                </>
              )
            )}
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Cloud Workspaces Available Now
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05]">
            Stop configuring.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              Start building.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            KodeBox gives you a dedicated, resource-isolated cloud environment with a pre-configured IDE. Access your projects and a real-time web terminal from any browser.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Dynamic Hero Button */}
            {!loading && (
              isAuthenticated ? (
                <Link to="/dashboard" className="group flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 px-8 rounded-full transition-all text-lg active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]">
                  Open Workspace
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link to="/signup" className="group flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 px-8 rounded-full transition-all text-lg active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]">
                  Launch Workspace
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )
            )}
            <a href="https://github.com/Pratham2779/Kodebox" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#111] hover:bg-[#1a1a1a] text-white font-semibold py-4 px-8 rounded-full transition-all text-lg border border-white/10 active:scale-95">
              Read Documentation
            </a>
          </div>
        </div>
      </section>

      {/* IDE Mockup (Hero Graphic) */}
      <section className="px-4 pb-32 max-w-6xl mx-auto relative z-10">
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-emerald-900/10 overflow-hidden ring-1 ring-white/5">
          <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#111]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="mx-auto flex items-center gap-2 text-xs font-mono text-zinc-500 bg-black/50 px-3 py-1 rounded-md border border-white/5">
              <Lock className="w-3 h-3" /> yourname-kodebox.prathamesh.site
            </div>
          </div>
          <div className="flex h-[400px] sm:h-[500px]">
            <div className="hidden sm:block w-64 border-r border-white/10 bg-[#0a0a0a] p-4 font-mono text-sm">
              <div className="text-zinc-500 mb-2 uppercase text-[10px] tracking-widest font-bold">Explorer</div>
              <div className="text-zinc-300 flex items-center gap-2 py-1"><span className="text-emerald-400">workspace</span></div>
              <div className="text-zinc-500 flex items-center gap-2 py-1 pl-4">src</div>
              <div className="text-zinc-300 flex items-center gap-2 py-1 pl-4 bg-white/5 rounded">app.js</div>
              <div className="text-zinc-500 flex items-center gap-2 py-1 pl-4">package.json</div>
            </div>
            <div className="flex-1 bg-[#050505] p-6 font-mono text-sm sm:text-base leading-relaxed text-zinc-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Code2 className="w-32 h-32" /></div>
              <p><span className="text-emerald-400">import</span> express <span className="text-emerald-400">from</span> <span className="text-amber-300">'express'</span>;</p>
              <p className="mt-2"><span className="text-emerald-400">const</span> app = express();</p>
              <p className="mt-2">app.get(<span className="text-amber-300">'/'</span>, (req, res) =&gt; {'{'}</p>
              <p className="pl-4 text-zinc-400">res.send(<span className="text-amber-300">'Hello from Kodebox Workspace!'</span>);</p>
              <p>{'});'}</p>
              
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#050505] to-transparent border-t border-white/5 p-4 flex flex-col justify-end">
                <p className="text-emerald-400">kodebox@workspace:~$ <span className="text-zinc-100">node app.js</span></p>
                <p className="text-zinc-500 mt-1">Server listening on port 3000</p>
                <p className="text-zinc-500">➜  Proxy:   Traefik loadbalancer active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 max-w-6xl mx-auto px-4 relative z-10">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Built for velocity.</h2>
          <p className="text-zinc-400 text-lg">Real infrastructure mapped to your workflow.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[280px]">
          
          {/* Feature 1 (Spans 2 columns) */}
          <div className="md:col-span-2 relative group bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-white/20 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
            <Cpu className="w-10 h-10 text-emerald-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3 text-white">Resource-Isolated Compute</h3>
            <p className="text-zinc-400 max-w-sm">
              Your code runs in a containerized LinuxServer environment. Hard limits on CPU, memory, and processes ensure your dev server runs predictably without interference.
            </p>
            <div className="absolute -bottom-6 -right-6 text-[100px] text-white/[0.02] font-black pointer-events-none group-hover:scale-110 transition-transform duration-500">
              ISOLATED
            </div>
          </div>

          {/* Feature 2 */}
          <div className="md:col-span-1 relative group bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-white/20 transition-colors flex flex-col justify-end">
             <div className="absolute top-8 right-8">
               <Globe className="w-10 h-10 text-blue-400" />
             </div>
             <h3 className="text-xl font-bold mb-2 text-white">Instant Routing</h3>
             <p className="text-zinc-400 text-sm">
               We automatically configure Traefik load balancers to route a unique, secure subdomain directly to your running workspace port.
             </p>
          </div>

          {/* Feature 3 */}
          <div className="md:col-span-1 relative group bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-white/20 transition-colors">
             <Lock className="w-10 h-10 text-rose-400 mb-6" />
             <h3 className="text-xl font-bold mb-2 text-white">Secure Access</h3>
             <p className="text-zinc-400 text-sm">
               Your web IDE is locked behind an auto-generated password. WebSockets terminal access is strictly bound to your authenticated session.
             </p>
          </div>

          {/* Feature 4 (Spans 2 columns) */}
          <div className="md:col-span-2 relative group bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-white/20 transition-colors">
            <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-blue-500/10 to-transparent" />
            <div className="flex flex-col md:flex-row gap-8 items-center h-full">
              <div className="flex-1">
                <Database className="w-10 h-10 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold mb-3 text-white">Persistent Volumes & S3 Backups</h3>
                <p className="text-zinc-400">
                  The <code className="bg-white/10 px-1 py-0.5 rounded text-xs">/workspace</code> directory survives reboots via dedicated Docker volumes. Schedule monthly or trigger manual snapshots directly to AWS S3.
                </p>
              </div>
              <div className="hidden md:flex flex-1 justify-end">
                <div className="w-full max-w-[200px] space-y-3">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-3/4" />
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-1/2" />
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-5/6" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Scalable Resources</h2>
          <p className="text-zinc-400 text-lg">Billing plans directly tied to your container's physical limits.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-zinc-400 text-sm mb-6">For students and quick tests.</p>
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">₹0</span>
            </div>
            <ul className="space-y-4 flex-grow mb-8">
              <PricingFeature text="1 Core CPU Limit" />
              <PricingFeature text="1 GB RAM" />
              <PricingFeature text="7 GB Volume Storage" />
              <PricingFeature text="Manual Backups Only" />
            </ul>
            <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white text-center transition-colors">
              {isAuthenticated ? "Go to Dashboard" : "Start Free"}
            </Link>
          </div>

          {/* Starter Tier (Highlighted) */}
          <div className="relative p-8 rounded-3xl bg-[#111] border border-emerald-500/30 flex flex-col shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-bold mb-2 text-emerald-400">Starter</h3>
            <p className="text-zinc-400 text-sm mb-6">For side projects & active dev.</p>
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">₹249</span>
              <span className="text-zinc-500 text-sm"> / 6-months</span>
            </div>
            <ul className="space-y-4 flex-grow mb-8">
              <PricingFeature text="2 Core CPU Limit" />
              <PricingFeature text="2 GB RAM" />
              <PricingFeature text="15 GB Volume Storage" />
              <PricingFeature text="Automated Monthly Backups" />
              <PricingFeature text="Up to 7 Stored Snapshots" />
            </ul>
            <Link to={isAuthenticated ? "/dashboard/upgrade-plan" : "/signup"} className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-black text-center transition-colors">
              {isAuthenticated ? "Upgrade Now" : "Choose Starter"}
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col">
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <p className="text-zinc-400 text-sm mb-6">For heavy continuous workloads.</p>
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">₹499</span>
              <span className="text-zinc-500 text-sm"> / 6-months</span>
            </div>
            <ul className="space-y-4 flex-grow mb-8">
              <PricingFeature text="4 Core CPU Limit" />
              <PricingFeature text="4 GB RAM" />
              <PricingFeature text="25 GB Volume Storage" />
              <PricingFeature text="Automated Monthly Backups" />
              <PricingFeature text="Up to 7 Stored Snapshots" />
            </ul>
            <Link to={isAuthenticated ? "/dashboard/upgrade-plan" : "/signup"} className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white text-center transition-colors">
              {isAuthenticated ? "Upgrade Now" : "Choose Pro"}
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <Code2 className="w-4 h-4 text-white" />
            <span className="font-bold text-sm text-white">KodeBox</span>
          </div>
          <p className="text-zinc-600 text-xs">
            Built with purpose by Prathamesh Gurav. © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

// Helper for pricing list items
const PricingFeature = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3 text-zinc-300 text-sm">
    <Zap className="w-4 h-4 text-emerald-500 opacity-70 shrink-0" />
    <span>{text}</span>
  </li>
);

export default LandingPage;