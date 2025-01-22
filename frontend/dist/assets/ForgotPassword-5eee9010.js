import{u as w,a as h,r as p,b as v,o as t,c as f,w as n,d as s,e as l,_ as k,h as i,t as g,f as d,j as E,F,E as S,i as B,g as c}from"./index-8f2d3d2e.js";import{_ as C}from"./AuthLayout-349c8c2b.js";import{t as V,o as P,s as R}from"./vee-validate-zod-0b684b67.js";const j={class:"bg-white p-8 rounded-lg shadow-lg max-w-md w-full"},N={class:"flex justify-center mb-6"},A={key:0,class:"mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md"},M={class:"space-y-4"},T={key:0,class:"bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative",role:"alert"},z={class:"block sm:inline"},D=["disabled"],$={key:0},q={key:1},H={class:"mt-4 text-center text-sm text-gray-600"},K={__name:"ForgotPassword",setup(I){w();const x=h(),o=p(""),u=p(""),y=V(P({email:R().min(1,"Email is required").email("Please enter a valid email address")})),_=async m=>{var e,r;try{o.value="";const a=await x.forgotPassword(m.email);a.status==="success"?u.value="Reset instructions have been sent to your email address. Please check your inbox.":o.value=a.message||"Failed to send reset instructions"}catch(a){o.value=((r=(e=a.response)==null?void 0:e.data)==null?void 0:r.message)||"Failed to send reset instructions"}};return(m,e)=>{const r=v("router-link");return t(),f(C,null,{default:n(()=>[s("div",j,[s("div",N,[l(r,{to:{name:"home"},class:"inline-block w-20 h-20"},{default:n(()=>[l(k,{isDark:!1})]),_:1})]),e[4]||(e[4]=s("h2",{class:"text-2xl font-bold mb-2 text-center text-gray-900"}," Reset Your Password ",-1)),e[5]||(e[5]=s("p",{class:"text-gray-600 text-center mb-6"}," Enter your email address and we'll send you instructions to reset your password. ",-1)),u.value?(t(),i("div",A,g(u.value),1)):(t(),f(d(E),{key:1,"validation-schema":d(y),onSubmit:_},{default:n(({errors:a,isSubmitting:b})=>[s("div",M,[s("div",null,[e[0]||(e[0]=s("label",{for:"email",class:"block text-sm font-medium mb-1 text-gray-700"}," Email Address ",-1)),l(d(F),{id:"email",name:"email",type:"email",class:"w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",placeholder:"Enter your email address"}),l(d(S),{name:"email",class:"mt-1 text-sm text-red-500"})]),o.value?(t(),i("div",T,[s("span",z,g(o.value),1)])):B("",!0),s("button",{type:"submit",disabled:b,class:"w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"},[b?(t(),i("span",$,e[1]||(e[1]=[s("svg",{class:"animate-spin -ml-1 mr-3 h-5 w-5 text-white",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24"},[s("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"}),s("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})],-1),c(" Sending... ")]))):(t(),i("span",q,"Send Reset Instructions"))],8,D),s("p",H,[e[3]||(e[3]=c(" Remember your password? ")),l(r,{to:{name:"login"},class:"font-medium text-blue-600 hover:text-blue-500"},{default:n(()=>e[2]||(e[2]=[c(" Back to login ")])),_:1})])])]),_:1},8,["validation-schema"]))])]),_:1})}}};export{K as default};