import * as React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../components/index.module.css"

const IndexPage = ({ data }) => {
  console.log(data)
  return (
    <Layout>
      <h2>Welcome guys!</h2>
      <ul className={styles.list}>
        {data.allMarkdownRemark.edges.map(({ node }) => {
          return (
            <li key={node.id} className={styles.listItem}>
              <p>
                <Link className={styles.listItemLink} to={node.fields.slug}>
                  {node.frontmatter.title} ↗
                </Link>
                <span style={{ color: "#bbb" }}>--{node.frontmatter.date}</span>
              </p>
              <p
                className={styles.listItemDescription}
                dangerouslySetInnerHTML={{ __html: node.excerpt }}
              ></p>
            </li>
          )
        })}
      </ul>
    </Layout>
  )
}

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="Home" />

export default IndexPage

export const query = graphql`
  query {
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          id
          fields {
            slug
          }
          html
          frontmatter {
            date(formatString: "")
            title
            anthor
          }
          excerpt(format: HTML)
        }
      }
    }
  }
`
