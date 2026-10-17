import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ label, page, rows, total, onPage, onRows }) {
  const pages = Math.max(1, Math.ceil(total / rows))
  const current = Math.max(1, Math.min(page, pages))
  const numbers = [...new Set([1, ...Array.from({length:5},(_,index)=>current-2+index), pages])].filter(value=>value>0&&value<=pages).sort((a,b)=>a-b)
  const style = 'grid size-7 place-items-center rounded-md border border-border bg-card text-xs text-foreground disabled:opacity-40'
  return <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
    <div className="flex items-center gap-2"><label className="flex items-center gap-2">Rows per page:<select aria-label={`${label} rows per page`} className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground" value={rows} onChange={event=>onRows(Number(event.target.value))}>{[10,15,25,50].map(value=><option key={value} value={value}>{value}</option>)}</select></label><span>{total?(current-1)*rows+1:0}&ndash;{Math.min(current*rows,total)} of {total}</span></div>
    <nav aria-label={`${label} pagination`} className="flex items-center gap-1"><button type="button" className={style} aria-label={`Previous ${label} page`} disabled={current===1} onClick={()=>onPage(current-1)}><ChevronLeft size={14}/></button>{numbers.map((value,index)=><span key={value} className="flex items-center gap-1">{index>0&&value>numbers[index-1]+1&&<span aria-hidden="true">...</span>}<button type="button" className={`${style} ${current===value?'border-primary bg-primary text-primary-foreground':''}`} aria-label={`${label} page ${value}`} aria-current={current===value?'page':undefined} onClick={()=>onPage(value)}>{value}</button></span>)}<button type="button" className={style} aria-label={`Next ${label} page`} disabled={current===pages} onClick={()=>onPage(current+1)}><ChevronRight size={14}/></button></nav>
  </div>
}
