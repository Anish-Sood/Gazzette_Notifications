let departmentData=[]
let gazetteTypeData=[]
let gazetteCategoryData=[]
let notificationData=[]
const departmentName=document.getElementById('departmentName')
const gazetteType=document.getElementById('GazetteType')
const gazetteCategory=document.getElementById('GazetteCategory')
const departmentForm=document.getElementById('departmentForm')


document.addEventListener('DOMContentLoaded', (e)=>{
    fetchdepartment();
    fetchgazette();
    document.getElementById('GazetteType').parentElement.style.display = 'none';
    document.getElementById('GazetteCategory').parentElement.style.display = 'none';
})

function removeAfterSubmit(){
    const prevdiv=document.getElementById('notificationMessage')
    if(prevdiv)
        prevdiv.remove();
    const prevButton = document.getElementById('downloadbutton');
    if(prevButton) 
        prevButton.remove();
}

async function fetchdepartment(){
    try{
        const response = await fetch('https://dsa.punjab.gov.in/egazette/api/Department/DepartmentList')
        if (!response.ok) throw new Error('Failed to fetch departments');
        const result =await response.json();
    
        if(result.response===1 &&result.data){
            departmentData=result.data;

        const select = document.getElementById('departmentName');
            
        departmentData.forEach(department => {
            const option = document.createElement('option');
            option.value = department.Dept_Id;
            option.textContent = department.Dept_Name;  
            select.appendChild(option);
        });
    }
    } catch(error){
        console.error('Error:', error);
        alert('Could not load departments. Please check your connection.');
    }
}


async function fetchgazette(){
    try{
        if(gazetteTypeData.length === 0){
            const response = await fetch('https://dsa.punjab.gov.in/egazette/api/Gazette/GazetteTypeList')
            // if (!response.ok) throw new Error('Failed to fetch Gazzeete');
            const result =await response.json();
        
            if(result.response===1 &&result.data){
                gazetteTypeData=result.data;
            }
        }

        if(gazetteTypeData.length > 0){

            const select = document.getElementById('GazetteType');
            
            gazetteTypeData.forEach(gazetteType => {
                const option = document.createElement('option');
                option.value = gazetteType.Gazette_Type_Id;
                option.textContent = gazetteType.Gazette_Type_Name;  
                select.appendChild(option);
            });
        }
    } catch(error){
        console.error('Error:', error);
        alert('Could not load gazzetteTypes. Please check your connection.');
    }
}

// async function fetchgazette
async function fetchgazettecategory(value){
    
    try{
        const response = await fetch(`https://dsa.punjab.gov.in/egazette/api/GazetteCategory/GazetteCategoryList/${value}`)
        if (!response.ok) throw new Error('Failed to fetch Gazzeete category');
        const result =await response.json();
    
        if(result.response===1 &&result.data){
            gazetteCategoryData=result.data;

            const select = document.getElementById('GazetteCategory');
            
            gazetteCategoryData.forEach(gazetteCategory => {
                const option = document.createElement('option');
                option.value = gazetteCategory.Gazette_Category_Id;
                option.textContent = gazetteCategory.Gazette_Category_Name;  
                select.appendChild(option);
                // console.log(`${gazetteCategory.Gazette_Category_Id}`)
            });
        }
    } catch(error){
        console.error('Error:', error);
        alert('Could not load gazzette Category. Please check your connection.');
    }
}

departmentName.addEventListener('change',(e)=>{
    removeAfterSubmit()

    // const typeSelect = document.getElementById('GazetteType');
    // typeSelect.options.length = 0;
    // const defaultOption = document.createElement('option');
    // defaultOption.value = "";
    // defaultOption.textContent = "-- Select Gazette Type --";
    // typeSelect.appendChild(defaultOption);

    const gazette_parent = document.getElementById('GazetteType').parentElement
    // console.log(gazette_parent.className);
    // console.log(gazette_parent)
    if(e.target.value){
        gazette_parent.style.display='block'
        // fetchgazette();
    }
})


gazetteType.addEventListener('change',(e)=>{
    removeAfterSubmit()

    const gazettecategory_parent=document.getElementById('GazetteCategory').parentElement;
    const categorySelect = document.getElementById('GazetteCategory');
    categorySelect.options.length = 0;

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "-- Select Gazette Category --";
    categorySelect.appendChild(defaultOption);

    // console.log(gazettecategory_parent);
    if(e.target.value){
        gazettecategory_parent.style.display='block'
        fetchgazettecategory(gazetteType.value);
    }
})

gazetteCategory.addEventListener('change', (e)=>{
    removeAfterSubmit()
})

departmentForm.addEventListener('submit',async (e)=>{
    e.preventDefault();
    removeAfterSubmit()

    const newdiv=document.createElement('div')
    newdiv.id="notificationMessage"

    const total_notifications = await fetchnotifications();
    if (!total_notifications){
        newdiv.textContent=`No notifications present`
        document.body.appendChild(newdiv);
    }
    else{
        newdiv.textContent=`${total_notifications} notifications fetched successfully`
        document.body.appendChild(newdiv);
        downloadnotifications();
    }
})

async function fetchnotifications(){
    const deptId=departmentName.value;
    const gazetteTypeid=gazetteType.value;
    const gazetteCategoryid=gazetteCategory.value;
    const startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;

    if(!endDate){
        endDate=new Date().toISOString().substring(0,10)
    }

    try{
        const response=await fetch('https://dsa.punjab.gov.in/egazette/api/Final/FinalFilter',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Dept_Id': deptId
        },
        body : JSON.stringify({
            'Dept_Id': deptId,
            'Gazette_Type_Id': gazetteTypeid,
            'Gazette_Category_Id': gazetteCategoryid,
            fromdate: startDate,
            todate: endDate
        })
    })
    const result = await response.json();
    // console.log('Notifications:', result);
    if(result.response === 1 && result.data){
        notificationData = result.data.map(notification => ({
            id: notification.Request_Id,
            gazette_date: notification.Gazette_Date.substring(0, 10).replace(/\//g,'_'),
            title: notification.Notification_Title.substring(0, 80)
        }));
    }
    const total_notifications=result.data.length;
    return total_notifications;
    } catch (error) {
        console.log(`error: `,error)
    }
}

function downloadnotifications(){
    const newbutton=document.createElement('button')
    newbutton.id="downloadbutton";
    newbutton.textContent="Download Notifications"
    document.body.appendChild(newbutton);
    
    newbutton.addEventListener('click',async (e)=>{
        const zip = new JSZip();
        let downloadCount=0;
        for(const notification of notificationData){
            const response=await fetch("https://dsa.punjab.gov.in/egazette/api/Final/Output_Copy",{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "Request_Id": `${notification.id}`
                })
            })
            console.log(notification.id)
            const result=await response.json();
            if(result.response === 1 && result.data && result.data[0].Output_File){
                const base64Data = result.data[0].Output_File;
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                    
                for(let i = 0; i < binaryString.length; i++){
                    bytes[i] = binaryString.charCodeAt(i);
                }
                // binarystring= "ABC"
                // charCodeAt:   65, 66, 67
                // bytes array:  [65, 66, 67]      
                // file to zip
                // console.log(`${notification.gazette_date}`)
                const filename = `${notification.gazette_date}_${notification.title}_${notification.id}.pdf`;
                zip.file(filename, bytes);
                downloadCount++;
                    
                console.log(`added: ${filename}`);
            }
        }
        if(downloadCount > 0){
            zip.generateAsync({type: 'blob'}).then((blob)=>{
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `notifications_${new Date().toLocaleTimeString()}.zip`;
                link.click();
                URL.revokeObjectURL(url);
            });
        } else {
            alert('No PDFs downloaded');
        }
    })
}