


function initFilmsPage(){
    const container = d3.select("#films-page")
    const loaded = document.getElementById("films-page");
    if(!loaded){
        console.log('not loaded')
        return
    }
    console.log("here")
    layoutDashboard(container, imageSceneData, audioSceneData, captionData); 
        
}