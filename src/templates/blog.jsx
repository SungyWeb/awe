import React, { useEffect, useRef, useState } from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { Anchor } from "antd"
import "antd/es/anchor/style/css"
const indentMap = {
  H1: 0,
  H2: "0.5em",
  H3: "1em",
  H4: "1.5em",
  H5: "2em",
  H6: "2.5em",
}
export default function Blog({ data }) {
  const post = data.markdownRemark
  const boxRef = useRef()
  const [navs, setNavs] = useState([])
  const [anchorLeft, setAnchorLeft] = useState(0)
  useEffect(() => {
    if (!boxRef.current) return
    const eles = boxRef.current.children
    const tags = ["H1", "H2", "H3", "H4", "H5", "H6"]
    const _navs = []
    for (let i = 0; i < eles.length; i++) {
      const item = eles[i]
      const tag = item.tagName
      if (tags.includes(tag)) {
        const id = Math.random().toString(16).slice(-8)
        item.setAttribute("id", id)
        _navs.push({ id, text: item.innerText, tag })
      } else {
        continue
      }
    }
    setNavs(_navs)
    function setLeft() {
      let left = -200
      if (window.innerWidth > 1200) {
        left = window.innerWidth - (window.innerWidth - 864) / 2
      }
      setAnchorLeft(left)
    }
    setLeft()
    window.addEventListener("resize", setLeft)
    return () => window.removeEventListener("resize", setLeft)
  }, [])
  return (
    <Layout>
      <>
        <div ref={boxRef} dangerouslySetInnerHTML={{ __html: post.html }} />
        <Anchor
          style={{ position: "fixed", left: anchorLeft, top: 100, width: 150 }}
        >
          {navs.map(v => (
            <Anchor.Link
              key={v.id}
              href={"#" + v.id}
              title={<Text tagName={v.tag} text={v.text} />}
            ></Anchor.Link>
          ))}
        </Anchor>
      </>
    </Layout>
  )
}

function Text({ text, tagName }) {
  return <span style={{ paddingLeft: indentMap[tagName] }}>{text}</span>
}
export const query = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        date
        path
        tag
      }
    }
  }
`
