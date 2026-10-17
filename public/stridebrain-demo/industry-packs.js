/**
 * Industry pack registry. Nothing here is proprietary customer data.
 * The UI / state machine must be industry neutral; examples live in these packs.
 * Add new industries by defining a pack and a valid seed JSON.
 */
export const INDUSTRY_PACKS = Object.freeze({
  interior: Object.freeze({
    id:"interior",name:"Interior design",company:"禾序空間設計",companyEn:"Horizon Atelier",
    industryDescription:"Design & renovation studio",symbol:"禾",short:"Interiors",
    dataset:"../stridebrain-interiors/seed.json",locale:"zh-TW",currency:"TWD",projectLabel:"Projects",
    itemLabel:"project",itemLabelPlural:"projects",itemSingular:"Project",orderLabel:"Work orders",
    entityLabel:"Project",quoteLabel:"Quotations",materialLabel:"Materials & suppliers",clientLabel:"Client",
    businessTerm:"renovation projects",companyLine:"Your plans, prices and people. Working together.",
    outcomeLine:"Keep design decisions, client commitments and site activity in sync.",
    cue:"What needs my attention across our renovation projects?",
    dateLabel:"As of 18 Oct 2026 · illustrative records",owner:"Mei Lin",ownerInitials:"ML",
    promptSuggestions:[
      "What needs my attention today?",
      "Review the Songshan quartz countertop change",
      "Which site tasks are blocked?",
      "Show the materials schedule for Songshan"
    ],
    scenario:{
      id:"CHG-101-QZ",name:"Kitchen countertop · Quartz upgrade",
      projectId:"PRJ-101",newWorkId:"WO-VAR-101",
      changeObject:"quartz countertop",original:"Standard solid-surface kitchen worktop",
      proposed:"Quartz kitchen countertop, warm stone finish",
      sourceIds:["DOC-1006","DOC-1010","STD-101","STD-102"],
      customerName:"Songshan Residence customer",
      inquiryEn:"Can we change the kitchen countertop to quartz? How much extra will it cost and will completion be delayed?",
      inquiryZh:"我們能不能把廚房檯面改成石英石？大概會增加多少費用？會影響完工日期嗎？",
      supplierName:"Stonefield Surfaces (fictional sample)",
      customerChannel:"LINE / email (not connected)",
      unresolved:"Supplier lead time and final field measurements remain unverified.",
      ownerApprovalText:"Owner reviews the price and scope variation",
      customerApprovalText:"Customer signs the revised scope and quoted price",
      downstreamTask:"Coordinate approved quartz countertop upgrade",
      costLabel:"Incremental direct cost",
      cost:60000,margin:25,tax:5,
      risk:"A draft kitchen elevation must not replace the approved construction revision without the signed change order.",
      customerReply:{
        enStart:"Thank you for the proposed change to the Songshan Residence kitchen countertop.",
        zhStart:"您好，感謝您提出松山住宅廚房檯面改為石英石的需求。",
        enPending:"We are checking supplier availability and internal pricing. We will provide a confirmed variation quote once the required reviews are complete.",
        zhPending:"目前我們正在確認材料供應與內部報價，完成審核後會再提供正式變更報價。",
        enApproved:"The internally reviewed draft variation amount is {total}, including the illustrative tax assumption, subject to your written approval.",
        zhApproved:"依目前完成內部審核的示範資料，暫估變更金額含稅為 {total}，仍須經您書面確認才能執行。",
        enEnd:"We cannot confirm a revised completion date until supplier lead time and installation requirements are verified.\n\nHorizon Atelier · Project Team",
        zhEnd:"供應商交期及施工影響尚未確認，因此現階段無法承諾新的完工日期。\n\n禾序空間設計｜專案團隊"
      }
    }
  }),
  printing: Object.freeze({
    id:"printing",name:"Printing & packaging",company:"晴川印務",companyEn:"Clearprint Studio",
    industryDescription:"Commercial printing & packaging",symbol:"晴",short:"Print studio",
    dataset:"./seeds/printing.json",locale:"zh-TW",currency:"TWD",projectLabel:"Jobs",
    itemLabel:"print job",itemLabelPlural:"print jobs",itemSingular:"Print job",orderLabel:"Production orders",
    entityLabel:"Job",quoteLabel:"Print quotations",materialLabel:"Paper & suppliers",clientLabel:"Customer",
    businessTerm:"print jobs",companyLine:"Proofs, production and pricing in one operational view.",
    outcomeLine:"Coordinate specifications, stock, customer approvals and delivery.",
    cue:"Which print jobs need proof, stock or price approval?",
    dateLabel:"As of 18 Oct 2026 · illustrative records",owner:"Lin Yu",ownerInitials:"LY",
    promptSuggestions:[
      "What needs attention today?",
      "Review the Minquan paper stock substitution",
      "Which press jobs are blocked?",
      "Find the latest artwork checklist"
    ],
    scenario:{
      id:"CHG-201-RP",name:"Recycled-paper stock substitution",
      projectId:"JOB-201",newWorkId:"PRWO-VAR-201",
      changeObject:"recycled 170gsm paper stock",original:"150gsm coated A3 poster stock",
      proposed:"Recycled 170gsm A3 poster stock; print proof pending",
      sourceIds:["PRDOC-2004","PRDOC-2007","PRSTD-203","PRSTD-204"],
      customerName:"Minquan Poster Run customer",
      inquiryEn:"Can we change our 500 A3 posters to recycled paper? What is the price difference, and will delivery slip?",
      inquiryZh:"我們這批500張A3海報可以改成再生紙嗎？需要加價多少？會延後交貨嗎？",
      supplierName:"EcoPaper House (fictional sample)",
      customerChannel:"LINE / email (not connected)",
      unresolved:"Certification, paper availability, proof approval and press capacity have not been confirmed.",
      ownerApprovalText:"Manager reviews revised print quotation and production feasibility",
      customerApprovalText:"Customer approves revised stock, proof and price",
      downstreamTask:"Release revised recycled-stock production job ticket",
      costLabel:"Incremental direct cost",
      cost:2400,margin:30,tax:5,
      risk:"A recycled-paper claim must not be made until the stock and supplier certification have been verified.",
      customerReply:{
        enStart:"Thank you for considering recycled paper for your 500 A3 posters.",
        zhStart:"您好，謝謝您詢問這批500張A3海報改用再生紙的可能性。",
        enPending:"We are checking the paper stock, proof requirements and revised production costs. We will share an approved quotation once these checks are complete.",
        zhPending:"目前正在核對紙材現貨、打樣需求以及追加製作成本，待完成內部審核後會提供正式報價。",
        enApproved:"The internally reviewed draft adjustment is {total}, including the illustrative tax assumption, subject to your written acceptance.",
        zhApproved:"目前完成內部審核的示範追加報價含稅為 {total}，仍需您書面確認才能變更工單。",
        enEnd:"We cannot promise a revised delivery date or certification claim before confirming the stock and production schedule.\n\nClearprint Studio · Production Team",
        zhEnd:"供貨、打樣與機台排程仍待確認，因此現階段無法承諾新的交期或紙材認證聲明。\n\n晴川印務｜製作團隊"
      }
    }
  })
});
export function getPack(id){
  return INDUSTRY_PACKS[id]||INDUSTRY_PACKS.interior;
}
export function listPacks(){
  return Object.values(INDUSTRY_PACKS);
}
