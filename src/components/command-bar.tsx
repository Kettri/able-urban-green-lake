import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { routeQuery } from "../reference/query.ts"
import { useLabQuery } from "./lab-shell.tsx"

export function CommandBar({ initial = "" }: { initial?: string }) {
  const navigate = useNavigate()
  const { embed } = useLabQuery()
  const [text, setText] = useState(initial)
  const [miss, setMiss] = useState("")

  function go() {
    const hit = routeQuery(text)
    if (hit.module === "bolts") {
      setMiss("")
      void navigate({ to: "/bolts", search: embed ? { q: hit.q, embed: "1" } : { q: hit.q } })
      return
    }
    if (hit.module === "units") {
      setMiss("")
      void navigate({ to: "/units", search: embed ? { q: hit.q, embed: "1" } : { q: hit.q } })
      return
    }
    if (hit.module === "plate") {
      setMiss("")
      void navigate({ to: "/plate", search: embed ? { embed: "1" } : {} })
      return
    }
    setMiss("Not recognised. Try M24 8.8, 350 MPa, or plate buckling.")
  }

  return (
    <form
      className="command"
      onSubmit={(event) => {
        event.preventDefault()
        go()
      }}
    >
      <input
        className="refSearch"
        aria-label="Reference search"
        placeholder='M24 8.8    ·    350 MPa    ·    1450 rpm    ·    3/4 UNC'
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setText("")
            setMiss("")
          }
        }}
      />
      <button className="toolBtn" type="submit">OPEN</button>
      {miss ? <p className="failBanner spanAll">{miss}</p> : null}
    </form>
  )
}
