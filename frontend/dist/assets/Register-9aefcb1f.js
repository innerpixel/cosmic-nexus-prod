import{u as k,a as C,r as x,b as _,o,c as p,w as b,d as s,e as t,_ as E,f as r,F as m,E as d,h as f,t as S,i as P,g as y,j as M}from"./index-8f2d3d2e.js";import{_ as A}from"./AuthLayout-349c8c2b.js";import{t as $,o as V,s as u}from"./vee-validate-zod-0b684b67.js";import{r as z,a as B}from"./EyeIcon-54d2a192.js";const D={class:"bg-white p-8 rounded-lg shadow-lg max-w-md w-full"},L={class:"flex justify-center mb-6"},R={class:"space-y-4"},q={class:"flex"},F={class:"relative"},j={key:0,class:"bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative",role:"alert"},T={class:"block sm:inline"},I=["disabled"],Z={key:0},H={key:1},J={class:"mt-6 text-center text-sm"},W={__name:"Register",setup(Y){const w=k(),v=C(),n=x(""),c=x(!1),h=$(V({displayName:u().min(5,"Display name must be at least 5 characters").max(100,"Display name is too long").refine(l=>{const e=l.trim().split(/\s+/);return e.length>=1&&e.length<=3&&e.every(a=>a.length>=5)},"Each word must be at least 5 letters long, and you can use 1 to 3 words"),csmclName:u().min(1,"CSMCL name is required").max(30,"CSMCL name must be less than 30 characters").regex(/^[a-z0-9]+$/,"CSMCL name can only contain lowercase letters and numbers"),regularEmail:u().min(1,"Email is required").email("Please enter a valid email address"),simNumber:u().min(1,"SIM number is required").regex(/^\+?[1-9]\d{1,14}$/,"Please enter a valid phone number"),password:u().min(8,"Password must be at least 8 characters").regex(/[A-Z]/,"Password must contain at least one uppercase letter").regex(/[a-z]/,"Password must contain at least one lowercase letter").regex(/[0-9]/,"Password must contain at least one number").regex(/[^A-Za-z0-9]/,"Password must contain at least one special character")})),N=async l=>{var e,a;try{n.value="";const i=await v.register({...l,email:`${l.csmclName}@cosmical.me`});i.status==="success"?w.push({name:"verify-email",query:{email:l.regularEmail}}):n.value=i.message||"Registration failed"}catch(i){n.value=((a=(e=i.response)==null?void 0:e.data)==null?void 0:a.message)||"Registration failed"}};return(l,e)=>{const a=_("router-link");return o(),p(A,null,{default:b(()=>[s("div",D,[s("div",L,[t(a,{to:{name:"home"},class:"inline-block w-20 h-20"},{default:b(()=>[t(E,{isDark:!1})]),_:1})]),e[12]||(e[12]=s("h2",{class:"text-2xl font-bold mb-6 text-center text-gray-900"}," Join CSMCL SPACE ",-1)),t(r(M),{"validation-schema":r(h),onSubmit:N},{default:b(({errors:i,isSubmitting:g})=>[s("div",R,[s("div",null,[e[1]||(e[1]=s("label",{for:"displayName",class:"block text-sm font-medium mb-1 text-gray-700"}," Display Name ",-1)),t(r(m),{id:"displayName",name:"displayName",type:"text",class:"w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",placeholder:"Enter 1-3 words (min 5 letters per word)"}),t(r(d),{name:"displayName",class:"mt-1 text-sm text-red-500"}),e[2]||(e[2]=s("p",{class:"mt-1 text-sm text-gray-500"}," Each word should be at least 5 letters. You can use 1 to 3 words. ",-1))]),s("div",null,[e[4]||(e[4]=s("label",{for:"csmclName",class:"block text-sm font-medium mb-1 text-gray-700"}," CSMCL Name ",-1)),s("div",q,[t(r(m),{id:"csmclName",name:"csmclName",type:"text",class:"flex-1 px-4 py-2 rounded-l border border-r-0 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",placeholder:"cosmicalyou"}),e[3]||(e[3]=s("span",{class:"inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r"}," @cosmical.me ",-1))]),t(r(d),{name:"csmclName",class:"mt-1 text-sm text-red-500"})]),s("div",null,[e[5]||(e[5]=s("label",{for:"regularEmail",class:"block text-sm font-medium mb-1 text-gray-700"}," Regular Email (for verification) ",-1)),t(r(m),{id:"regularEmail",name:"regularEmail",type:"email",class:"w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",placeholder:"your-email@example.com"}),t(r(d),{name:"regularEmail",class:"mt-1 text-sm text-red-500"})]),s("div",null,[e[6]||(e[6]=s("label",{for:"simNumber",class:"block text-sm font-medium mb-1 text-gray-700"}," SIM Number (for verification) ",-1)),t(r(m),{id:"simNumber",name:"simNumber",type:"tel",class:"w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",placeholder:"+1234567890"}),t(r(d),{name:"simNumber",class:"mt-1 text-sm text-red-500"})]),s("div",null,[e[7]||(e[7]=s("label",{for:"password",class:"block text-sm font-medium mb-1 text-gray-700"}," Password ",-1)),s("div",F,[t(r(m),{type:c.value?"text":"password",id:"password",name:"password",class:"w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",placeholder:"Create a strong password"},null,8,["type"]),s("button",{type:"button",onClick:e[0]||(e[0]=G=>c.value=!c.value),class:"absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"},[c.value?(o(),p(r(B),{key:1,class:"h-5 w-5"})):(o(),p(r(z),{key:0,class:"h-5 w-5"}))])]),t(r(d),{name:"password",class:"mt-1 text-sm text-red-500"}),e[8]||(e[8]=s("p",{class:"mt-2 text-sm text-gray-500"}," Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters ",-1))]),n.value?(o(),f("div",j,[s("span",T,S(n.value),1)])):P("",!0),s("button",{type:"submit",disabled:g,class:"w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"},[g?(o(),f("span",Z,e[9]||(e[9]=[s("svg",{class:"animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24"},[s("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"}),s("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})],-1),y(" Creating Account... ")]))):(o(),f("span",H,"Create Account"))],8,I)])]),_:1},8,["validation-schema"]),s("div",J,[e[11]||(e[11]=s("span",{class:"text-gray-600"},"Already have an account?",-1)),t(a,{to:{name:"login"},class:"ml-1 font-medium text-blue-600 hover:text-blue-500"},{default:b(()=>e[10]||(e[10]=[y(" Sign in ")])),_:1})])])]),_:1})}}};export{W as default};
