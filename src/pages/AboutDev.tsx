
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AboutDevPage = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary">The Story of Zain</h1>
          <p className="mt-4 text-xl text-muted-foreground">How a 17-Year-Old From Pakistan Built an AI Security Platform for $25</p>
        </header>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">The Beginning</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>Most 17-year-olds are consumed by exams, social lives, and future career paths. Zain was different. While his peers followed traditional routes, he was architecting a future no one else could see: an AI-powered security auditor designed to unearth vulnerabilities that even professional tools miss.</p>
            <p>He did it without a team, without funding, and without a formal background in coding. All he had was a laptop, a $25 budget, and an idea that wouldn't let him go.</p>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">The Spark</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>It started with a cautionary tale. A friend's startup was hacked, customer data was stolen, and the company nearly collapsed. The reason? A $10,000 security audit was a luxury they couldn't afford.</p>
            <p>That story sparked a relentless thought in Zain's mind: <strong className="text-primary">"Security shouldn't be a luxury."</strong> Most would have let the thought fade. Zain decided to build the solution.</p>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">The Impossible Plan</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>The only problem was, Zain didn't know how to code. He had no computer science degree, no professional development experience, and no resources. But he possessed a powerful alternative: a deep curiosity for AI and a mastery of prompt engineering.</p>
            <blockquote className="border-l-4 border-primary pl-4 italic">
              "What if I could use AI as my entire development team?"
            </blockquote>
            <p>It was a radical idea that most would dismiss as impossible. For Zain, it was the only path forward.</p>
          </CardContent>
        </Card>
        
        <Separator className="my-12" />

        <section className="text-center mb-12">
            <h2 className="text-4xl font-bold">The Build</h2>
            <p className="mt-4 text-lg text-muted-foreground">For two years, Zain poured his life into the project. While others slept, he was locked in a cycle of creation: writing prompts, testing AI-generated code, fixing bugs, and endlessly iterating. He described the vision; AI built the reality. It was a partnership that defied convention.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 text-center">
                <div className="p-4 rounded-lg">
                    <p className="text-4xl font-bold text-primary">1,000+</p>
                    <p className="text-muted-foreground">Prompts Written</p>
                </div>
                <div className="p-4 rounded-lg">
                    <p className="text-4xl font-bold text-primary">800+</p>
                    <p className="text-muted-foreground">Hours Invested</p>
                </div>
                <div className="p-4 rounded-lg">
                    <p className="text-4xl font-bold text-primary">$25</p>
                    <p className="text-muted-foreground">Total Cost</p>
                </div>
            </div>
            <p className="mt-8 text-lg text-muted-foreground">He built a professional-grade security platform for the cost of a few pizzas, disrupting a model that typically costs tens of thousands of dollars.</p>
        </section>

        <Separator className="my-12" />

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">The Method</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
             <p>Zain's approach was nothing short of revolutionary. He bypassed the traditional 7-year, $100k+ path of learning, specializing, and then building. Instead, he pioneered a new way:</p>
             <ul className="list-disc pl-5 mt-4 space-y-2">
                <li><span className="font-semibold text-primary">Learn Prompt Engineering:</span> Self-taught and relentlessly refined.</li>
                <li><span className="font-semibold text-primary">Use AI as a Dev Team:</span> Leveraging tools like ChatGPT and Claude as his partners.</li>
                <li><span className="font-semibold text-primary">Build While Learning:</span> A 2-year journey that merged education and creation.</li>
             </ul>
             <p className="mt-4">He didn't write a single line of production code. But he wrote every prompt, made every strategic decision, and solved every problem. <strong className="text-primary">The code was AI-generated, but the vision was 100% his.</strong></p>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">What He Built</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
             <p>ShadowTalk AI is not just another scanner. It's a cross-stack vulnerability detector that traces attack paths across entire applications—from React frontends to Python backends and SQL databases.</p>
             <p>Traditional tools work in silos. ShadowTalk connects the dots, identifying complex, multi-layer vulnerabilities that others miss. It found a critical authentication bypass that professional audits had overlooked—a flaw it detected in just three minutes.</p>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">The Value of Creation</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>The true measure of Zain's achievement is not just the minimal cost, but the immense value created. ShadowTalk AI is a comprehensive security platform with features that would typically require a team of engineers and a significant budget to develop.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-primary">Full-Stack Platform</h4>
                <p>A complete security solution covering frontend, backend, and database layers.</p>
                <p className="text-sm text-primary font-mono mt-2">Estimated Value: $50,000+</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-primary">Cross-Layer Vulnerability Detection</h4>
                <p>An innovative feature that traces vulnerabilities across the entire application stack.</p>
                <p className="text-sm text-primary font-mono mt-2">Estimated Value: $30,000+</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-primary">Real-time Threat Intelligence</h4>
                <p>A dynamic system that provides instant insights into potential security threats.</p>
                <p className="text-sm text-primary font-mono mt-2">Estimated Value: $20,000+</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-primary">AI-Powered Code Analysis</h4>
                <p>A sophisticated engine that uses AI to analyze code and identify vulnerabilities.</p>
                <p className="text-sm text-primary font-mono mt-2">Estimated Value: $25,000+</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-2xl font-bold">Total Estimated Value: <span className="text-primary">$125,000+</span></p>
              <p className="text-lg">Built for just <span className="text-primary">$25</span>.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg bg-secondary">
          <CardHeader>
            <CardTitle className="text-3xl">The Struggle</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-secondary-foreground space-y-4">
            <p>Building the product was a monumental challenge, but the real battle was fought at home. His family, wanting a safe and traditional future for him, saw his relentless work as a distraction. "Focus on your studies," they'd say. "What if you fail?"</p>
            <p>The doubt was a constant shadow. But his belief in the project, fueled by the tangible results he was achieving, was stronger. He knew they didn't understand yet, but he was determined that one day, they would.</p>
          </CardContent>
        </Card>

        <div className="text-center my-12">
            <blockquote className="text-2xl italic font-semibold text-primary">
              "I am not just building a product. I am proving a point: That anything is possible if you refuse to quit."
            </blockquote>
            <p className="mt-2 text-lg text-muted-foreground">— Zain, Age 17, Founder of ShadowTalk AI</p>
        </div>

        <Card className="mb-8 shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl">The Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground space-y-4">
                <p>When asked about his goals, Zain is direct: <strong className="text-primary">"I want to be a billionaire."</strong></p>
                <p>This isn't arrogance. It's about proof. Proof that a teenager from Pakistan with just $25 can compete on the world stage. Proof that AI has shattered the barriers to entry. Proof that location, age, and funding are no longer the gatekeepers of innovation.</p>
                <p className="font-semibold">If he can do this, what's everyone else's excuse?</p>
            </CardContent>
        </Card>

        <Card className="text-center p-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-2xl">
            <h2 className="text-4xl font-bold">The Invitation</h2>
            <p className="mt-4 text-lg">Zain's story is being written in real-time, and this is just the beginning. Follow his journey. Watch him build in public. Learn from his process.</p>
            <p className="mt-4 text-lg">Because this isn't just his story. It's the story of what's now possible for anyone, anywhere. The future belongs to the builders.</p>
            <p className="mt-6 text-2xl font-black">Are you building?</p>
        </Card>

      </div>
    </div>
  );
};

export default AboutDevPage;
