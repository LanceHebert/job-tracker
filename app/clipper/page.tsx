"use client";
import { useEffect, useMemo, useRef } from "react";

export default function Clipper() {
  const bookmarklet = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const target = `${origin}/new`;
    const code = `(()=>{try{
      function tryDirect(d){
        try{ var ww=window.open(d,'_blank','noopener,noreferrer'); if(ww){ try{ww.opener=null;}catch(_){ } return true } }catch(_e){}
        return false
      }
      // Pre-open a blank tab synchronously to avoid popup blockers
      var w=window.open('', '_blank');
      if(w){ try{ w.opener=null; }catch(_e){} }
      function openDest(d){
        if(tryDirect(d)) return;
        if(w){ try{ w.location=d; return; }catch(_x){} }
        // Try anchor click with target _blank
        try{
          var a=document.createElement('a'); a.href=d; a.target='_blank'; a.rel='noopener noreferrer';
          (document.body||document.documentElement).appendChild(a); a.click(); a.parentNode.removeChild(a);
          return;
        }catch(_y){}
        // Try form submit with target _blank (often allowed when user-initiated)
        try{
          var f=document.createElement('form'); f.action=d; f.method='GET'; f.target='_blank';
          (document.body||document.documentElement).appendChild(f); f.submit(); f.parentNode.removeChild(f);
          return;
        }catch(_z){}
        // Last resort: do not navigate same-tab; inform user to allow popups
        alert('Please allow pop-ups for this site to open the Add Job form in a new tab.');
      }
      function text(sel){var el=document.querySelector(sel);return el?String(el.textContent||'').trim():''}
      function html(sel){var el=document.querySelector(sel);return el?String(el.innerText||el.textContent||'').trim():''}
      function textAll(sel){var list=document.querySelectorAll(sel), out=''; for(var i=0;i<list.length && i<4;i++){var t=String(list[i].innerText||list[i].textContent||'').trim(); if(t){out+= (out?' \u2022 ':'')+t}} return out}
      function fromJSONLD(){try{var scripts=document.querySelectorAll('script[type="application/ld+json"]');for(var i=0;i<scripts.length;i++){try{var d=JSON.parse(scripts[i].textContent||'{}');var arr=Array.isArray(d)?d:[d];for(var j=0;j<arr.length;j++){var n=arr[j];if(n && (n['@type']==='JobPosting'||(Array.isArray(n['@type'])&&n['@type'].indexOf('JobPosting')>-1)) && n.description){var tmp=document.createElement('div'); tmp.innerHTML=String(n.description); return tmp.innerText.trim()}}}catch(_){} } }catch(_e){} return ''}
      function getDesc(){
        var picks=[
          '#jobDescriptionText', '[data-testid*="JobDescriptionText"]', '.jobsearch-jobDescriptionText', // Indeed
          '.show-more-less-html__markup', '[data-test-id*="job-details"]', '[data-job-description]', // LinkedIn
          '.posting-description', '.section.page-full-width', // Lever
          '[data-automation-id="jobPostingDescription"]', // Workday
          '[data-testid*="job-description"]', // Ashby
          '.content [itemprop="description"]', '[itemprop="description"]', '.content .section', '.description'
        ];
        for(var k=0;k<picks.length;k++){var s=picks[k]; var h=html(s); if(h && h.length>60){
          // Trim boilerplate common on Indeed
          h=h.replace(/\s+Find jobs, Company reviews, Salaries.*$/i,'').trim();
          return h;
        }}
        var ld=fromJSONLD(); if(ld && ld.length>60) return ld;
        var fallback=textAll('article, main, [role="main"]'); if(fallback.length>120) return fallback;
        return '';
      }
      var body=(document.body && (document.body.innerText||''))||''; var lower=body.toLowerCase();
      var url=location.href; var source=location.hostname;
      function cleanTitle(t){ if(!t) return ''; t=String(t).replace(/\s+/g,' ').trim();
        if(/\bwhat\b/i.test(t)&&/\bwhere\b/i.test(t)) return '';
        if(/find jobs|company reviews|salaries|post a job/i.test(t)) return '';
        if(/^what\b/i.test(t) || /^where\b/i.test(t)) return '';
        if(/indeed/i.test(t) && /job search/i.test(t)) return '';
        return t.length>200? t.slice(0,200): t;
      }
      function titleFromJSONLD(){
        try{
          var scripts=document.querySelectorAll('script[type="application/ld+json"]');
          for(var i=0;i<scripts.length;i++){
            try{
              var d=JSON.parse(scripts[i].textContent||'{}');
              var arr=Array.isArray(d)?d:[d];
              for(var j=0;j<arr.length;j++){
                var n=arr[j];
                var t=n && (n.title || n.name || n.jobTitle || n.positionTitle);
                if(n && (n['@type']==='JobPosting'||(Array.isArray(n['@type'])&&n['@type'].indexOf('JobPosting')>-1)) && t){
                  t=String(t).replace(/<[^>]+>/g,'');
                  t=t.replace(/\s+/g,' ').trim();
                  t=cleanTitle(t); if(t) return t;
                }
              }
            }catch(_){ }
          }
        }catch(_e){}
        return '';
      }
      function titleFromMeta(){
        var el=document.querySelector('meta[property="og:title"]')||document.querySelector('meta[name="twitter:title"]');
        var c=el && (el.getAttribute('content')||'');
        return cleanTitle(c||'');
      }
      function pickTitle(){
        var host=location.hostname;
        if(/indeed\./i.test(host)){
          var root=document.querySelector('#jobsearch-ViewjobPaneWrapper, [data-testid*="ViewjobPane"], main');
          var inRoot=function(sel){ if(!root) return ''; var el=root.querySelector(sel); return el?String(el.textContent||'').trim():'' };
          var ipicks=['h1.jobsearch-JobInfoHeader-title','[data-testid*="JobInfoHeader-title"]','[data-testid*="jobTitle"]','h1'];
          for(var z=0;z<ipicks.length;z++){ var t=cleanTitle(inRoot(ipicks[z])); if(t) return t }
        }
        var tld=titleFromJSONLD(); if(tld) return tld;
        var tmeta=titleFromMeta(); if(tmeta) return tmeta;
        var picks=['main h1, [role="main"] h1','[data-test-id="top-card-layout__title"]','[data-testid*="job-title"]','[class*="jobTitle"]'];
        for(var i=0;i<picks.length;i++){ var t=cleanTitle(text(picks[i])); if(t) return t }
        return cleanTitle(document.title||'');
      }
      var title=pickTitle();
      var company=text('[data-company],[data-test-company-name],[data-testid*="company"],a[href*="/company"],[class*="company"]')||'';
      var loc=text('[data-test-location],[data-testid*="location"],[class*="location"],[itemprop="jobLocation"]')||'';
      var salary=textAll('[data-testid*="salary"],[class*="salary"],[data-test*="salary"],[id*="salary"]');
      var remoteType=''; if(lower.indexOf('remote')>-1) remoteType='REMOTE'; else if(lower.indexOf('hybrid')>-1) remoteType='HYBRID'; else if(lower.indexOf('on-site')>-1||lower.indexOf('onsite')>-1||lower.indexOf('on site')>-1) remoteType='ONSITE';
      var desc=getDesc();
      // Prefer window.name transport to avoid URL size limits and CORS/popup constraints
      var payload={title:title,company:company,location:loc,salary:salary,remoteType:remoteType,url:url,source:source,description:desc};
      try{ if(w){ w.name='JOBDATA::'+encodeURIComponent(JSON.stringify(payload)); } }catch(_n){}
      var dest='${target}?from=clipper';
      openDest(dest);
    }catch(e){alert('Clip failed: '+(e&&e.message?e.message:e))}})();`;
    return `javascript:${encodeURIComponent(code)}`;
  }, []);

  const linkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (linkRef.current) linkRef.current.setAttribute("href", bookmarklet);
  }, [bookmarklet]);

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <div className="max-w-2xl mx-auto rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-3">Job Clipper</h1>
        <p className="text-sm text-slate-600 mb-4">Drag this button to your bookmarks bar. When on a job page, click it to prefill the Add Job form.</p>
        <a ref={linkRef} className="inline-block px-4 py-2 bg-black text-white rounded-md" href="#" onClick={(e)=>e.preventDefault()}>Save Job</a>
        <p className="text-xs text-slate-500 mt-2">Clicking here is disabled for security; use it from your bookmarks bar.</p>
      </div>
    </div>
  );
}


