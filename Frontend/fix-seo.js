const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'src', 'app');

// --- CONFIGURATION ---

const SEO_PAGES = [
  {
    relPath: 'page.tsx',
    clientName: 'HomeClient',
    type: 'static',
    metaImport: 'homeMetadata',
    metaExport: 'export const metadata: Metadata = homeMetadata;'
  },
  {
    relPath: path.join('product', '[slug]', 'page.tsx'),
    clientName: 'ProductClient',
    type: 'dynamic-product'
  },
  {
    relPath: path.join('category', '[slug]', 'page.tsx'),
    clientName: 'CategoryClient',
    type: 'dynamic-category'
  },
  {
    relPath: path.join('product-type', '[slug]', 'page.tsx'),
    clientName: 'ProductTypeClient',
    type: 'dynamic-product-type'
  },
  {
    relPath: path.join('search', 'page.tsx'),
    clientName: 'SearchClient',
    type: 'dynamic-search'
  },
  {
    relPath: path.join('partner-with-us', 'page.tsx'),
    clientName: 'PartnerWithUsClient',
    type: 'static',
    metaImport: 'partnerWithUsMetadata',
    metaExport: 'export const metadata: Metadata = partnerWithUsMetadata;'
  },
  {
    relPath: path.join('auth', 'login', 'page.tsx'),
    clientName: 'LoginClient',
    type: 'static',
    metaImport: 'loginMetadata',
    metaExport: 'export const metadata: Metadata = loginMetadata;'
  },
  {
    relPath: path.join('auth', 'register', 'page.tsx'),
    clientName: 'RegisterClient',
    type: 'static',
    metaImport: 'signupMetadata',
    metaExport: 'export const metadata: Metadata = signupMetadata;'
  },
  {
    relPath: path.join('seller', 'login', 'page.tsx'),
    clientName: 'SellerLoginClient',
    type: 'static',
    metaImport: 'buildMetadata',
    metaExport: `export const metadata: Metadata = buildMetadata({
  title: "Seller Login | Kiranase",
  description: "Login to your Kiranase seller account.",
  keywords: "seller, login, kiranase",
  noIndex: true,
});`
  }
];

// --- UTILS ---

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walk(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

function removeMetadata(content) {
  let newContent = content;
  // Remove Metadata type import
  newContent = newContent.replace(/^import type\s*{\s*Metadata\s*}\s*from\s*["']next["'];?\r?\n?/gm, '');
  // Remove any SEO imports
  newContent = newContent.replace(/^import\s*{[^}]*}\s*from\s*["']@\/seo["'];?\r?\n?/gm, '');
  // Remove export const metadata (handles multi-line)
  newContent = newContent.replace(/export const metadata: Metadata\s*=\s*[\s\S]*?;(?:\r?\n|$)/g, '');
  newContent = newContent.replace(/export const metadata\s*=\s*[\s\S]*?;(?:\r?\n|$)/g, '');
  
  // Remove generateMetadata block (handles nested braces)
  function removeGenerateMetadata(str) {
    const regex = /export async function generateMetadata[\s\S]*?{/;
    const match = str.match(regex);
    if (!match) return str;

    let start = match.index;
    let braceCount = 0;
    let i = start + match[0].length - 1;
    
    for (; i < str.length; i++) {
      if (str[i] === '{') braceCount++;
      if (str[i] === '}') {
        braceCount--;
        if (braceCount === 0) break;
      }
    }
    
    const before = str.substring(0, start);
    const after = str.substring(i + 1).trimStart();
    return before + after;
  }

  let finalContent = removeGenerateMetadata(newContent);
  // Also catch simple one-liners if any
  finalContent = finalContent.replace(/export async function generateMetadata[\s\S]*?}\r?\n?/g, '');

  return finalContent.trim();
}

// --- MAIN SCRIP LOGIC ---

let cleanedCount = 0;
let wrappedCount = 0;

console.log('--- PART A: CLEAN ALL FILES ---');

walk(srcAppDir, (filePath) => {
  const fileName = path.basename(filePath);
  if (fileName === 'layout.tsx' || fileName !== 'page.tsx') return;

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('export const metadata') || content.includes('generateMetadata') || content.includes('@/seo')) {
    const cleaned = removeMetadata(content);
    // Preserving "use client" if it was there
    let final = cleaned;
    if (content.includes('"use client"') || content.includes("'use client'")) {
       if (!final.startsWith('"use client"') && !final.startsWith("'use client'")) {
         final = '"use client";\n\n' + final;
       }
    }
    fs.writeFileSync(filePath, final, 'utf8');
    console.log(`Cleaned: ${filePath}`);
    cleanedCount++;
  }
});

console.log('\n--- PART B & C: WRAPPER PATTERN ---');

SEO_PAGES.forEach(page => {
  const fullPath = path.join(srcAppDir, page.relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping (not found): ${fullPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const isClient = content.includes('"use client"') || content.includes("'use client'");

  if (isClient) {
    const dir = path.dirname(fullPath);
    const compDir = path.join(dir, '_components');
    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir);

    const clientFilePath = path.join(compDir, `${page.clientName}.tsx`);
    
    if (!fs.existsSync(clientFilePath)) {
      // 1. Move original content (cleaned) to _components
      const cleanedOriginal = removeMetadata(content);
      fs.writeFileSync(clientFilePath, cleanedOriginal, 'utf8');
      console.log(`Created Component: ${clientFilePath}`);
    } else {
      console.log(`Skipping Component (exists): ${clientFilePath}`);
    }

    // 2. Rewrite page.tsx as Server Wrapper
    let wrapperContent = `import type { Metadata } from "next";\n`;
    
    if (page.type === 'static') {
      wrapperContent += `import { ${page.metaImport} } from "@/seo";\n\n`;
      wrapperContent += `${page.metaExport}\n\n`;
    } else if (page.type === 'dynamic-product') {
      wrapperContent += `import { productPageMetadata } from "@/seo";\n\n`;
      wrapperContent += `export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return productPageMetadata({
    name: slug.replace(/-/g, " "),
    slug,
    description: "",
    category: "",
    brand: "",
    imageUrl: "",
  });
}\n\n`;
    } else if (page.type === 'dynamic-category') {
      wrapperContent += `import { categoryPageMetadata } from "@/seo";\n\n`;
      wrapperContent += `export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const displayName = slug.replace(/-/g, " ");
  return categoryPageMetadata(slug, displayName);
}\n\n`;
    } else if (page.type === 'dynamic-product-type') {
      wrapperContent += `import { buildMetadata } from "@/seo";\n\n`;
      wrapperContent += `export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");
  return buildMetadata({
    title: \`\${name} | Kiranase\`,
    description: \`Shop all \${name} products on Kiranase. Best prices, delivered in 30 minutes.\`,
    keywords: \`\${name}, buy \${name} online, Kiranase\`,
    path: \`/product-type/\${slug}\`,
  });
}\n\n`;
    } else if (page.type === 'dynamic-search') {
      wrapperContent += `import { searchPageMetadata } from "@/seo";\n\n`;
      wrapperContent += `export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return searchPageMetadata(q);
}\n\n`;
    }

    wrapperContent += `export { default } from "./_components/${page.clientName}";\n`;
    fs.writeFileSync(fullPath, wrapperContent, 'utf8');
    console.log(`Created Wrapper: ${fullPath}`);
    wrappedCount++;
  } else {
    // If it's already a server component, just ensure metadata is there
    console.log(`Page is already Server Component: ${fullPath}`);
    // Optional: could inject metadata here if missing, but requirements say Part B is for if page.tsx has "use client"
    // Requirement also says: "If the page.tsx does NOT have "use client" (already a Server Component): Just add metadata export at top"
    
    let serverContent = content;
    if (!content.includes('export const metadata') && !content.includes('generateMetadata')) {
       let metaSection = `import type { Metadata } from "next";\n`;
       if (page.type === 'static') {
         metaSection += `import { ${page.metaImport} } from "@/seo";\n\n`;
         metaSection += `${page.metaExport}\n\n`;
       } else if (page.type === 'dynamic-product') {
         metaSection += `import { productPageMetadata } from "@/seo";\n\nexport async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;return productPageMetadata({name:slug.replace(/-/g," "),slug,description:"",category:"",brand:"",imageUrl:""});}\n\n`;
       } else if (page.type === 'dynamic-category') {
         metaSection += `import { categoryPageMetadata } from "@/seo";\n\nexport async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const displayName=slug.replace(/-/g," ");return categoryPageMetadata(slug,displayName);}\n\n`;
       } else if (page.type === 'dynamic-product-type') {
         metaSection += `import { buildMetadata } from "@/seo";\n\nexport async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const name=slug.replace(/-/g," ");return buildMetadata({title:\`\${name} | Kiranase\`,description:\`Shop all \${name} products on Kiranase.\`,keywords:\`\${name}\`,path:\`/product-type/\${slug}\`});}\n\n`;
       } else if (page.type === 'dynamic-search') {
         metaSection += `import { searchPageMetadata } from "@/seo";\n\nexport async function generateMetadata({searchParams}:{searchParams:Promise<{q?:string}>}):Promise<Metadata>{const {q}=await searchParams;return searchPageMetadata(q);}\n\n`;
       }
       fs.writeFileSync(fullPath, metaSection + serverContent, 'utf8');
       console.log(`Injected Metadata into Server Component: ${fullPath}`);
    }
  }
});

console.log(`\nDONE! Summary: cleaned ${cleanedCount} files, created ${wrappedCount} wrappers.`);
