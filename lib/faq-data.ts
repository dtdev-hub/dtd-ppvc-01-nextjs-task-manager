export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  items: FAQItem[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: "architecture",
    name: "I. Architecture & Tech Stack",
    icon: "Layers",
    items: [
      {
        id: "arch-1",
        question: "Why did you choose Next.js App Router over plain React (Vite) for a client-side storage project?",
        answer: "Architectural Vision: Next.js provides a strict folder convention and a pre-configured, highly optimized build pipeline. Even though the project currently relies on localStorage, the App Router architecture with Route Handlers allows seamless future migration to Serverless APIs (such as AWS Lambda) without rewriting the core framework.\n\nPerformance: Next.js inherently supports robust SEO optimization (Metadata API) and implements automatic route-based Code Splitting by default. This significantly optimizes Time to Interactive (TTI) compared to traditional Single Page Applications (SPAs)."
      },
      {
        id: "arch-2",
        question: "How did you define the Rendering Boundaries between Server and Client in this Next.js application?",
        answer: "I adopted a Hybrid Rendering approach to maximize performance based on the nature of each page:\n\n- About/Specification Page: Rendered via Static Generation (SSG) as a Server Component. All static text and complex SVG diagrams are pre-compiled into raw HTML at build time, leading to near-instantaneous load times and perfect SEO scores.\n\n- Dashboard/Task Page: Contains fast-changing application states and interacts directly with browser-native Web APIs (LocalStorage). Thus, these components are marked with the 'use client' directive, delegating state hydration and event handling entirely to the client-side browser."
      },
      {
        id: "arch-3",
        question: "Why did you opt for client-side localStorage instead of a centralized SQL/NoSQL database from the start? What are the architectural trade-offs?",
        answer: "Strategic Reasons:\n1. Zero Operational Cost: For a Minimum Viable Product (MVP), spinning up dedicated backend servers and database clusters (like PostgreSQL or MongoDB) incurs monthly baseline expenses. Utilizing localStorage ensures the app runs fully autonomous on the client side, keeping operational costs at exactly $0 even under massive concurrent traffic.\n2. Extreme Response Times: Reading and writing directly from the browser's memory eliminates network latency entirely. This significantly boosts Core Web Vitals (LCP/FID), which is vital for retaining users and optimizing SEO.\n\nArchitectural Trade-offs to Acknowledge:\n- Storage Limits: Restricted to ~5MB depending on the browser. Voluminous data accumulation will eventually trigger a QuotaExceededError.\n- CPU Blocking: LocalStorage is synchronous and only accepts strings. The application must constantly execute JSON.stringify() and JSON.parse(). For thousands of records, this data serialization happens on the CPU Main Thread, which can block user interactions.\n- Security Risk: Data is exposed to any script running on the same origin. If the app succumbs to a Cross-Site Scripting (XSS) vulnerability, malicious actors can easily extract all stored data."
      },
      {
        id: "arch-4",
        question: "Can you describe the CI/CD pipeline from your local environment to the production link on Netlify? How did you optimize it?",
        answer: "Automated Deployment Pipeline: I established a fully automated Git-ops workflow integrated with GitHub and Netlify. Whenever a feature or hotfix is committed and pushed to the main branch from my local workspace, Netlify triggers a webhook.\n\nRelease Optimization: Upon intercepting the repository update, Netlify spins up a secure build container, executes 'npm run build' to run static type checking, packages the static output, and distributes it across their Global Edge Network. This reduces deployment cycles from hours to seconds and eradicates human operational errors."
      }
    ]
  },
  {
    id: "code-design",
    name: "II. Code Design & Performance",
    icon: "Code",
    items: [
      {
        id: "code-1",
        question: "Why did you decompose the codebase into modular components like TaskContainer, TaskForm, TaskList, and TaskItem instead of maintaining a monolithic file?",
        answer: "Maintainability & Single Responsibility: Breaking down the UI ensures each component has exactly one reason to change. TaskForm exclusively manages user input capture and validation rules, while TaskItem is solely responsible for rendering individual task states.\n\nPerformance Isolation & Collaboration: Isolating logic limits scope creep during bug fixes or optimization tasks. Furthermore, this component architecture scales smoothly across engineering teams, dramatically reducing Git merge conflicts during concurrent development."
      },
      {
        id: "code-2",
        question: "How did you ensure the application remains highly responsive and free of UI lag during intensive user filtering or searching?",
        answer: "Centralized State Management: Instead of scattering decentralized states that trigger unpredictable re-renders, I hoisted core states into the parent TaskContainer. Search and filtering arrays are computed dynamically on the fly during the render loop rather than being synced to redundant secondary states.\n\nComponent Isolation: Fine-grained items like TaskItem are completely isolated. This leverages React's virtual DOM reconciliation efficiently, preventing a single keystroke in the search bar from forcing a re-render of hundreds of stable task rows, thus maintaining a solid 60 FPS.\n\nDebounce Mechanism: For high-frequency text inputs, processing every keystroke instantly would thrash low-end devices. I utilized a custom useDebounce hook to defer the search state synchronization by 250ms, coalescing rapid keystrokes into a single batch execution to conserve CPU cycles."
      },
      {
        id: "code-3",
        question: "If required to integrate advanced filters (e.g., multi-tag filtration, dynamic multi-column sorting), can your current architecture accommodate it instantly?",
        answer: "High Extensibility: Yes, absolutely. The core Task domain data structure is strictly typed via TypeScript Interfaces within the centralized types folder. The filtering pipeline inside TaskContainer is written using Pure Functions that accept a pristine source array and yield a calculated subset.\n\nImplementation Strategy: Introducing multi-tag filters or intricate sorting matrices simply involves extending the Task interface and chaining new decoupled utility helper functions into the existing computation stream. This requires zero structural rewrites of downstream layout consumers like TaskList or TaskItem."
      },
      {
        id: "code-4",
        question: "How do you manage task Due Dates to ensure cross-device consistency and avoid runtime format errors?",
        answer: "Data Type Synchronization: Due dates are strictly enforced as standard ISO Strings or uniform YYYY-MM-DD formats via the TypeScript interface. This guarantees seamless compatibility between native HTML5 date inputs and the JSON storage layers.\n\nDisplay and Warning Logic: At the UI layer, specialized helper functions convert the raw strings into localized, human-friendly presentation formats (e.g., DD/MM/YYYY). Simultaneously, the engine evaluates the stored date against midnight of the local system clock to dynamically calculate and attach an 'Overdue' state badge without timezone shifting bugs."
      },
      {
        id: "code-5",
        question: "How does the application handle multi-tab synchronization if a user modifies tasks in two browser windows simultaneously?",
        answer: "Cross-Tab Synchronization & Race Condition Mitigation: Since localStorage is shared across tabs under the same origin, concurrent mutations present a classic Race Condition risk where stale data can overwrite fresh states. While React state does not naturally listen to localStorage changes out of the box, the browser emits a native 'storage' system event.\n\nImplementation Solution: I attached a window.addEventListener('storage', callback) listener within a root useEffect hook. When a task is added, updated, or removed in Tab A, Tab B instantly intercepts the storage payload event and syncs its internal React state in real-time, enforcing global Data Consistency across tabs without a manual page reload."
      },
      {
        id: "code-6",
        question: "What exactly is a Hydration Error in Next.js, and how did you resolve it when integrating localStorage?",
        answer: "Root Cause of Hydration Failure: A hydration mismatch occurs when the server-pre-rendered DOM tree diverges from the first render tree generated by the client-side React engine during client hydration. Because localStorage data is strictly sandboxed inside the client's browser, the Node.js Server Environment sees an empty state and renders a blank placeholder, resulting in a severe DOM structure mismatch upon initial client evaluation.\n\nTechnical Resolution: I implemented an explicit mounting cycle guard using a combination of useEffect and an 'isMounted' boolean flag. The application safely outputs a stable, server-matching default skeleton state initially. Once the component establishes a successful client mount event, the flag flips to true, authorizing the application to read from localStorage and safely paint the true user state without interrupting the DOM layout."
      },
      {
        id: "code-7",
        question: "You have adopted React 19 and Tailwind CSS v4. What bleeding-edge features or build optimizations did you leverage?",
        answer: "React 19 advantages: The application prepares for automatic rendering optimization via the React Compiler ecosystem (embedded within modern Next.js channels) alongside vastly superior, descriptive Hydration Error reporting which minimizes debugging overhead. Furthermore, form management natively integrates with React 19 Actions primitives, cutting out redundant boilerplate code for task mutations.\n\nTailwind CSS v4 upgrades: v4 introduces an entirely overhauled Rust-based compilation engine, dramatically speeding up incremental project builds. The design tokens configuration has migrated seamlessly away from a legacy tailwind.config.js file directly into standard native CSS variables using the '@theme' directive, streamlining system-wide Dark/Light mode theme syncing."
      },
      {
        id: "code-8",
        question: "What is the primary security flaw of the current architecture? How does the application prevent Cross-Site Scripting (XSS) via form inputs?",
        answer: "Native Escape Defenses: In a Next.js and TypeScript environment, user-supplied text payloads captured from TaskForm are rendered inside standard React JSX expressions. By default, React automatically escapes and sanitizes all dynamic text nodes prior to injection into the document object model (DOM).\n\nSecurity Outcome: If a malicious actor injects standard dangerous payload strings (e.g., '<script>' tags), the browser processes the nodes strictly as safe, harmless text literals. Script execution pathways are entirely neutralized, neutralizing reflective XSS attacks at the front door."
      }
    ]
  },
  {
    id: "cloud-migration",
    name: "III. Cloud Migration (AWS)",
    icon: "Cloud",
    items: [
      {
        id: "cloud-1",
        question: "If migrating this client-side architecture to AWS Cloud, how would you design the target architecture?",
        answer: "Static Asset Hosting: The compiled static Next.js frontend code assets would be deployed to a secure AWS S3 Bucket, which sits behind an AWS CloudFront Distribution (CDN) for fast global delivery and SSL offloading via AWS Certificate Manager (ACM).\n\nServerless Tiers & Databases: I would migrate localStorage to AWS DynamoDB (a managed NoSQL database) to achieve infinite scaling capabilities with single-digit millisecond latency. The data manipulation layers (CRUD operations) would be handled by specialized AWS Lambda functions exposed via an AWS API Gateway, keeping the cloud ecosystem fully decoupled and cost-effective."
      },
      {
        id: "cloud-2",
        question: "Assuming rapid user growth requires cross-device sync and premium billing (B2C), how do you design the AWS architecture to minimize operating costs?",
        answer: "Static Frontend Layer: Maintain a pure Static Export configuration for Next.js, storing the distributed assets inside Amazon S3 and exposing them globally through CloudFront. Hosting and data transfer at the edge are exceptionally cheap at small-to-medium tiers and absorb traffic spikes seamlessly without infrastructure degradation.\n\nServerless Backend Compute: Avoid provisioning 24/7 EC2 servers that waste idle resources. Implement Amazon API Gateway tied to AWS Lambda functions built on Python. Under this 'Pay-As-You-Go' execution model, you are billed strictly per active API call request; when traffic drops to zero, the operational compute cost drops to exactly zero.\n\nNoSQL On-Demand Storage: Deploy Amazon DynamoDB configured with on-demand auto-scaling capacity mode. It features a generous Free Tier (25GB storage), meaning data storage remains fully subsidized during initial user acquisition phases while maintaining high-velocity throughput."
      },
      {
        id: "cloud-3",
        question: "What are the exact, step-by-step technical procedures required to migrate this application from Netlify over to native AWS infrastructure?",
        answer: "Step 1: Configure Source Computations: Edit the file 'next.config.js' to append the setting 'output: \"export\"'. Run 'npm run build' locally to compel Next.js to dump completely compiled, static assets (HTML, CSS, JS) straight into an output directory ('/out').\n\nStep 2: Initialize Amazon S3 Storage: Provision a secure Amazon S3 Bucket. Enable the 'Static Website Hosting' configuration switch on the bucket instance and upload the entirety of the local '/out' directory assets.\n\nStep 3: Establish Global Distribution via CloudFront: Create an Amazon CloudFront CDN Distribution instance, pointing the origin path directly to the newly populated S3 bucket. Configure Origin Access Control (OAC) to cache static assets securely at geo-located global Edge Locations closest to end-users.\n\nStep 4: Domain Name & SSL Mapping: Request an SSL/TLS Certificate natively via AWS Certificate Manager (ACM) to authorize global HTTPS queries. Open AWS Route 53 to configure a managed Alias Record zone, mapping the custom enterprise domain directly onto the CloudFront distribution domain string."
      },
      {
        id: "cloud-4",
        question: "Can you sketch out the complete data flow route of a user query across your AWS Architecture Diagram? Why are the services ordered this way?",
        answer: "Complete Data Architecture Pathway:\nUser Browser -> Amazon Route 53 (DNS) -> Amazon CloudFront CDN (Secured via ACM SSL & AWS WAF) -> Amazon S3 Origin Bucket (Static Frontend Code Delivery).\n\nDesign Rationale: This pipeline adheres strictly to the AWS Well-Architected Framework for security and efficiency. Route 53 handles high-speed DNS routing. CloudFront serves as a global shield, completely masking the backend S3 bucket from raw public access via Origin Access Control (OAC) policies. Serving files directly out of CloudFront's distributed caching nodes ensures extreme user response speeds while saving S3 from handling redundant request loads, drastically driving down storage access costs."
      },
      {
        id: "cloud-5",
        question: "Under this pure S3 + CloudFront architecture model, what is the maximum concurrent user limit? Where does the ultimate system bottleneck sit?",
        answer: "Traffic Capacity: The static frontend hosting pipeline can handle virtually infinite concurrent connections (scaling smoothly up to millions of active hit requests simultaneously) without ever crashing or incurring latency penalties. This is because CloudFront offloads compute demands onto highly distributed network nodes that serve static content without evaluating runtime logic.\n\nInfrastructure Bottlenecks: In the current client-side localStorage phase, the cloud tier faces zero bottlenecks since there is no centralized database connection layer. However, if extended to a serverless backend tier (API Gateway + AWS Lambda + DynamoDB), the system bottleneck would eventually shift to the default AWS Lambda Concurrent Execution Limits (defaulting to 1,000 concurrent executions per region, expandable via quota requests) or the configured DynamoDB Read/Write Provisioned Capacity units."
      },
      {
        id: "cloud-6",
        question: "Provide a detailed operational monthly cost breakdown for maintaining this infrastructure on AWS. How do you actively optimize the cloud invoice?",
        answer: "Detailed Cost Estimation Matrix:\n- Amazon S3: Charged strictly per GB stored (~$0.023/GB) plus request operations. Since this entire compiled static asset bundle sits comfortably below 10MB, the direct storage expense rounds out to $0.00.\n- Amazon CloudFront: The AWS Free Tier offers a permanent allocation of 1TB Data Transfer Out and 10 million requests monthly, meaning zero costs at early scales.\n- Amazon Route 53: Fixed baseline cost of exactly $0.50 per month for hosting the custom DNS Hosted Zone configuration.\n- AWS Certificate Manager (ACM): Public TLS/SSL domain validation certificates are generated and auto-renewed at $0.00.\n- Cumulative Cost: Total baseline operational commitment ranges between $0.50 and $2.00/month for small-to-medium apps.\n\nInvoice Optimization Framework: To maintain a lean footprint as utilization grows, I would aggressively adjust CloudFront Cache Behaviors—maximizing the Time-to-Live (TTL) durations on unchanging build identifiers (.js, .css, images) to minimize origin read operations on S3. Additionally, enabling smart automatic Gzip/Brotli text encodings at the edge drastically reduces raw data transit volume, driving down bandwidth bills."
      }
    ]
  },
  {
    id: "advanced-db",
    name: "IV. Advanced Cloud DB & Logic",
    icon: "Database",
    items: [
      {
        id: "db-1",
        question: "In your cloud roadmap, why did you pair API Gateway + Lambda (Python) + DynamoDB Single-Table Design instead of choosing a relational database (RDS SQL)?",
        answer: "Serverless-First Philosophy for Elastic Scale:\n- Absolute Cost Efficiency: API Gateway, AWS Lambda, and Amazon DynamoDB all natively support an on-demand, pay-as-you-go execution model. If zero system requests come through, your active backend operational invoice drops to exactly $0.00, contrasting sharply with relational DBs (RDS) which demand 24/7 uptime payments regardless of utilization.\n- Python Lambda Performance: Employing Python as the core compute runtime minimizes cold start penalties compared to heavyweight runtimes like Java or .NET, while staying aligned with my backend programming specializations.\n- Single-Table Architecture Performance: Instead of normalizing tables and executing costly computational JOIN operations across distributed relational disks, Single-Table Design denormalizes all entities (Users, Tasks) into a solitary DynamoDB table. The runtime can fetch nested parent-child entities in a Single Network Roundtrip, guaranteeing predictable single-digit millisecond responses."
      },
      {
        id: "db-2",
        question: "How exactly do you design the Partition Key (PK) and Sort Key (SK) in a DynamoDB Single-Table schema to fetch user tasks and filter by completed status in a single query?",
        answer: "Schema Polymorphism Design:\n- I avoid named relational columns like 'userId' or 'taskId'. Instead, I define generalized generic string attributes labeled 'PK' and 'SK' to host distinct cross-domain entity records.\n- Data Fetch Route: For individual task mappings, the Partition Key (PK) uses a structured string convention such as 'USER#123' (where 123 represents the User ID), and the corresponding Sort Key (SK) is defined as 'TASK#456' (where 456 denotes the unique Task ID). Invoking a focused query command passing PK='USER#123' combined with an SK condition checking 'begins_with(\"TASK#\")' securely returns all structural tasks for that unique user inside a single index seek operation.\n- Status Filtering Optimization: To filter by completion state without executing expensive, full-table DynamoDB Scans, I overload the Sort Key structure into a composite token layout like 'TASK#STATUS#DATE' (e.g., 'TASK#COMPLETED#2026-07-01'). This allows for fine-grained query filters directly on the SK index array, or we can project an isolated Global Secondary Index (GSI) to track active tasks efficiently."
      },
      {
        id: "db-3",
        question: "How do you actively mitigate the AWS Lambda Cold Start problem when transitioning from Local-First to Serverless Python APIs?",
        answer: "Runtime & Package Optimization:\n- Language Selection: Python's lightweight, interpreted engine gives it an inherent advantage over compiled options like Java or .NET. It skips heavy virtual machine hydration overhead, resulting in baseline Python cold starts typically clocking in under 100ms to 200ms.\n- Package Minimization: I bundle compact deployment packages, strictly importing core code dependencies and avoiding bloated external packages to keep memory allocation cycles tight.\n- High-Availability Guardrails: If specific transactional application paths demand deterministic zero-latency responses under scale, I would selectively configure Provisioned Concurrency allotments to keep a hot pool of runtime execution contexts continuously awake."
      },
      {
        id: "db-4",
        question: "What are the most critical cloud-native security risks when building on AWS? How do you safeguard enterprise data assets?",
        answer: "Risk 1: Accidental Public Data Leaks via S3 Misconfigurations. Defense: Implement strict 'Block Public Access' configurations at the organizational bucket level, entirely disabling raw static website public hosting. Content reads are authenticated exclusively using an AWS CloudFront Origin Access Control (OAC) proxy identity, configured via an explicit, locked-down S3 Bucket Policy.\n\nRisk 2: Distributed Denial of Service (DDoS) and Billing Attacks via malicious API flood requests. Defense: Attach an AWS WAF (Web Application Firewall) directly in front of the CloudFront distribution to enforce strict global rate-limiting traffic policies that drop spam requests at the edge. Additionally, configure granular AWS Budgets thresholds that immediately trigger automated email and SMS notification text flags if billing tiers exceed safe parameters (e.g., a $5/day baseline limit).\n\nLayered Inspection Security: Integrating AWS WAF ahead of CloudFront also ensures the application inspects incoming payloads for deep application-layer anomalies like Cross-Site Scripting (XSS) script injections before the malicious string ever touches downstream Lambda computations."
      },
      {
        id: "db-5",
        question: "Since you rely on the browser's Same-Origin Policy (SOP) to safeguard local task data, what specific vulnerabilities can bypass SOP, and how do you prevent them?",
        answer: "The Vulnerability Matrix: The browser's native Same-Origin Policy (SOP) is designed to block external domains from extracting cookies or localStorage records belonging to your web app origin. However, SOP offers zero defense if an attacker executes a successful Cross-Site Scripting (XSS) attack. Because an XSS exploit runs malicious JavaScript directly within your application origin, the rogue script inherits full domain authorization and can read localStorage strings effortlessly.\n\nAdvanced Engineering Defenses:\n1. Strict React JSX Escaping: Ensures input nodes render securely as plain text string parameters, preventing primitive raw HTML script execution vectors.\n2. Content Security Policy (CSP) Infrastructure: On production build versions, I inject a comprehensive Content Security Policy via HTTP headers (configured inside Next.js config routing or edge Netlify rules). The CSP explicitly dictates authorized execution domains for scripts and assets, completely blocking unapproved dynamic inline script execution and neutralizing XSS vectors at the browser compilation layer."
      }
    ]
  }
];