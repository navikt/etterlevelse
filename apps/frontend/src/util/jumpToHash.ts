
//Methoud should be used in a useEffect
export const jumpToHash = () => {
  setTimeout(() => {
    const hash = window.location.hash.slice(1) // Remove the '#' character from the hash
    if (hash) {
      const element = document.getElementById(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, 100)
}

export default jumpToHash