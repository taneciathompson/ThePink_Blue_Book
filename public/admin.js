document.querySelector('.addNewPage').addEventListener('click', addPage)

async function addPage(){
    const siteName = document.querySelector('.siteName').value
    const siteLink = document.querySelector('.siteLink').value
    const siteCategory =document.querySelector('#pages').value

    // console.log(siteName, siteLink, siteCategory)

    const result = await fetch(`/newSite?siteName=${siteName}&siteLink=${siteLink}&siteCategory=${siteCategory}`)
    // const text = result.text()
    // console.log(text)
    
}