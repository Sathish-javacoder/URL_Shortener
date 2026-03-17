import React, { useState } from 'react'
import styles from './HeroSection.module.css'

function HeroSection({ onShorten, loading }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const validate = function(value)
                  {
                      if (!value.trim())
                       {
                         return 'Please enter a URL'
                       }
                         try 
                        {
                         const u = new URL(value)
                         if (!['http:', 'https:'].includes(u.protocol))
                          {
                            return 'URL must start with http:// or https://'
                          }
                        } 
                        catch 
                        {
                         return 'Please enter a valid URL (e.g. https://example.com)'
                        }
                     return ''
                    }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate(url)
    if (err)
       {
         setError(err); 
         return
       }
    setError('')
    await onShorten(url)
    setUrl('')
  }

  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Simplify your URL</h2>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          <input
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            type="url"
            value={url}
            onChange={e => {setUrl(e.target.value);
                     if (error)
                      {
                         setError('')
                      } }}
            placeholder="Enter your original URL e.g. http://demos.nelliwinne.net/URLShortener/"
          />
        
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Shorten URL
              </>
            )}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.hint}>All the Shorted URL and their analytics are public...</p>
      </div>
    </div>
  )
}

export default HeroSection
