import{o as s,h as o,d as t,u as E,k as M,a as S,r as u,l as I,m as N,b as z,c as D,w as g,e as m,_ as R,f as c,g as y,i as w,t as _}from"./index-8f2d3d2e.js";import{_ as $}from"./AuthLayout-349c8c2b.js";function j(k,v){return s(),o("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor","aria-hidden":"true","data-slot":"icon"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"})])}const A={class:"bg-white p-8 rounded-lg shadow-lg max-w-md w-full"},F={class:"flex justify-center mb-6"},H={key:0,class:"text-center py-8"},L={key:1,class:"text-center py-8"},Y={class:"mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100"},q={class:"mt-2 text-gray-600"},G={key:0},T={class:"mt-6"},U={key:2,class:"space-y-6"},Z={key:0,class:"bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative",role:"alert"},J={class:"text-sm"},K={class:"text-center"},O=["disabled"],P={key:0},Q={key:1},W={key:2},X={class:"text-center"},se={__name:"VerifyEmail",setup(k){const v=E(),V=M(),p=S(),x=u(!0),b=u(!1),i=u(""),d=u(!1),r=u(0),f=u(null),h=computed(()=>p.isSimVerified);I(async()=>{var e,n;const a=V.query.token;if(!a){i.value="Verification token is missing",x.value=!1;return}try{const l=await p.verifyEmail(a);l.status==="success"?b.value=!0:i.value=l.message||"Verification failed"}catch(l){i.value=((n=(e=l.response)==null?void 0:e.data)==null?void 0:n.message)||"Verification failed"}finally{x.value=!1}});const C=()=>{r.value=60,f.value=setInterval(()=>{r.value>0?r.value--:clearInterval(f.value)},1e3)},B=async()=>{var a,e;if(!(d.value||r.value>0))try{d.value=!0;const n=await p.resendVerificationEmail();n.status==="success"?C():i.value=n.message||"Failed to resend verification email"}catch(n){i.value=((e=(a=n.response)==null?void 0:a.data)==null?void 0:e.message)||"Failed to resend verification email"}finally{d.value=!1}};return N(()=>{f.value&&clearInterval(f.value)}),(a,e)=>{const n=z("router-link");return s(),D($,null,{default:g(()=>[t("div",A,[t("div",F,[m(n,{to:{name:"home"},class:"inline-block w-20 h-20"},{default:g(()=>[m(R,{isDark:!1})]),_:1})]),e[9]||(e[9]=t("h2",{class:"text-2xl font-bold mb-2 text-center text-gray-900"}," Verify Your Email ",-1)),x.value?(s(),o("div",H,e[2]||(e[2]=[t("svg",{class:"animate-spin h-10 w-10 text-blue-600 mx-auto",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24"},[t("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"}),t("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})],-1),t("p",{class:"mt-4 text-gray-600"},"Verifying your email...",-1)]))):b.value?(s(),o("div",L,[t("div",Y,[m(c(j),{class:"h-8 w-8 text-green-600"})]),e[4]||(e[4]=t("h3",{class:"mt-4 text-lg font-medium text-gray-900"},"Email Verified!",-1)),t("p",q,[e[3]||(e[3]=y(" Your email has been successfully verified. ")),c(h)?w("",!0):(s(),o("span",G,"Now let's verify your SIM number."))]),t("div",T,[c(h)?(s(),o("button",{key:1,onClick:e[1]||(e[1]=l=>c(v).push({name:"dashboard"})),class:"inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}," Go to Dashboard ")):(s(),o("button",{key:0,onClick:e[0]||(e[0]=l=>c(v).push({name:"verify-sim"})),class:"inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}," Continue to SIM Verification "))])])):(s(),o("div",U,[i.value?(s(),o("div",Z,[e[5]||(e[5]=t("p",{class:"font-medium"},"Verification Failed",-1)),t("p",J,_(i.value),1)])):w("",!0),t("div",K,[e[7]||(e[7]=t("p",{class:"text-gray-600 mb-4"}," Didn't receive the verification email? ",-1)),t("button",{onClick:B,disabled:d.value||r.value>0,class:"inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"},[d.value?(s(),o("span",P,e[6]||(e[6]=[t("svg",{class:"animate-spin -ml-1 mr-2 h-4 w-4",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24"},[t("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"}),t("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})],-1),y(" Sending... ")]))):r.value>0?(s(),o("span",Q," Resend in "+_(r.value)+"s ",1)):(s(),o("span",W," Resend Verification Email "))],8,O)]),t("div",X,[m(n,{to:{name:"login"},class:"text-sm font-medium text-blue-600 hover:text-blue-500"},{default:g(()=>e[8]||(e[8]=[y(" Back to Login ")])),_:1})])]))])]),_:1})}}};export{se as default};