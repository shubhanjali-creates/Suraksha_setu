import React, { useEffect, useRef, useState } from 'react'
import { useNavigate} from 'react-router-dom'
import "../../assets/CSS/Medicals.css"
import { useSelector } from 'react-redux'

export const Medicals = () => {
    const isAdmin = useSelector(state => state.roleState.isAdmin);
    const [updateMed, setUpdateMed]= useState(false);
    console.log(isAdmin);
    const [updateID, setUpdateID]= useState(0);

    const CName = useRef();
    const CAddress = useRef();
    const CHotline = useRef();
    const CEmail = useRef();
    const CRating = useRef();
    const CType = useRef();
    const CSeats = useRef();

    
    const navigate = useNavigate();
    const linkMedical=(id)=>{
        navigate(`/medical/${id}`);
    }
    const [showFilter, setShowFilter]= useState(false);
    const [MedicalCenters, setMedicalCenters] =useState([
        {
            ID : 1,
            Name :"Dr. B.R. Ambedkar Memorial Hospital",
            Address :"Kabir Nagar, Raipur, Chhattisgarh",
            Hotline : "0771-2891234",
            Email : "bramemorial@cghealth.gov.in",
            Rating : 4.9,
            Type : "Hospital",
            Seats : 1000
        },
        {
            ID : 2,
            Name :"AIIMS Raipur",
            Address :"Tatibandh, Raipur",
            Hotline : "0771-2573777",
            Email : "info@aiimsraipur.edu.in",
            Rating : 4.5,
            Type : "Hospital",
            Seats : 500 
        },
        {
            ID : 3,
            Name :"Community Relief Shelter, Bhubaneswar",
            Address :"Bhubaneswar, Odisha",
            Hotline : "0674-2390000",
            Email : "relief.bbsr@example.in",
            Rating : 4,
            Type : "Shelter",
            Seats : 200
        },
        {
            ID : 4,
            Name :"Government Relief Shelter, Chennai",
            Address :"Chennai, Tamil Nadu",
            Hotline : "044-25305000",
            Email : "relief.chennai@example.in",
            Rating : 3.5,
            Type : "Shelter",
            Seats : 150
        },
        {
            ID : 5,
            Name :"Pandit Deendayal Upadhyay Memorial Hospital",
            Address :"Tatibandh, Raipur",
            Hotline : "0771-2574212",
            Email : "dduhospital@cghealth.gov.in",
            Rating : 4.3,
            Type : "Hospital",
            Seats : 800
        }
    ]);
    const [allMedical, setAllMedical] = useState(MedicalCenters); 
    console.log(MedicalCenters);

    const filterRating=(rate)=>{
        const updatedMedicals= allMedical.filter((meds)=> meds.Rating >= rate && meds.Rating< rate+1)
        setMedicalCenters(updatedMedicals)
    }

    const filterType=(type)=>{
        if (type==="") {
            return;
        }
        const updatedMedicals= allMedical.filter((meds)=> meds.Type === type)
        setMedicalCenters(updatedMedicals)
    }
    
    const [rating,setRating]= useState(0);
    const [type,setType]= useState("");
    
    const controlFilter= ()=>{
        console.log(document.querySelector('.rating-filter').children);
        console.log(rating, type);
        if (rating===0 && type===""){
            setMedicalCenters(allMedical);
            return;
        }
        if (rating===0 ) filterType(type);
        else if(type==="") filterRating(rating)
        else{
            setMedicalCenters(allMedical.filter((meds)=>{
                return (meds.Rating>= rating && meds.Rating< rating+1) && meds.Type===type ;
            }))
        }
    }

    const RatingChange=(rate)=>{

        setRating(rate);
        const buttons = [4.5,4,3,2,0];
        buttons.forEach((btns)=>{
            const classes= document.querySelector(`.r-${Math.round(btns)}`).classList;
            if (rate===btns){
                console.log(classes);
                classes.add('active-btn');
            }
            else classes.remove('active-btn')
        })
    }

    const TypeChange=(types)=>{
        setType(types);
        if (types==="") types=" ";
        const buttons = ['H', 'S',' '];
        buttons.forEach((btns)=>{
            const classes= document.querySelector(`.t-${btns}`).classList;
            if (types[0]===btns){
                console.log(classes);
                classes.add('active-btn');
            }
            else classes.remove('active-btn')
        })
    }

    const updateForm=(id)=>{
        setUpdateID(id);
        console.log(id);
        var selectedMed= MedicalCenters.filter((meds)=> meds.ID===id);;
        CName.current.value= selectedMed[0].Name;
        CAddress.current.value= selectedMed[0].Address;
        CHotline.current.value= selectedMed[0].Hotline;
        CEmail.current.value= selectedMed[0].Email;
        CRating.current.value= selectedMed[0].Rating;
        CType.current.value= selectedMed[0].Type;
        CSeats.current.value= selectedMed[0].Seats;

    }
    
    const updateMedical=(id)=>{
        const updatedMed= {
            ID : id,
            Name : CName.current.value,
            Address : CAddress.current.value,
            Hotline : CHotline.current.value,
            Email : CEmail.current.value,
            Rating : CRating.current.value,
            Type : CType.current.value,
            Seats : CSeats.current.value
        }
        console.log(updatedMed);
        const updatedMedicals= MedicalCenters.map((meds)=>{
            if (meds.ID===id){
                return updatedMed;
            }
            return meds;
        })
        setMedicalCenters(updatedMedicals);
    }

    useEffect(()=>{
        controlFilter();
    },[rating,type])

  return (
    <>
        <h1 style={{ marginLeft : '10px'}}>Hospitals and Shelters Nearby : {MedicalCenters.length}</h1>
        <div className="filter-box">
            <button className='filter-btn' onClick={()=> setShowFilter(!showFilter)}>Filter</button>

            <div className="filter-options" style={{ display : showFilter ? 'flex' : 'none'}}>
                <div className="rating-filter">
                    <h3>Rating</h3>
                    <button className='r-5' onClick={(e)=> RatingChange(4.5)}>4.5-5</button>
                    <button className='r-4' onClick={()=> RatingChange(4)}>4-5</button>
                    <button className='r-3' onClick={()=> RatingChange(3)}>3-4</button>
                    <button className='r-2' onClick={()=> RatingChange(2)}>2-3</button><br/>
                    <button className='r-0 active-btn' onClick={()=> RatingChange(0)}>Clear</button>
                </div>
                <div className="type-filter">
                    <h3>Type</h3>
                    <button className='t-H' onClick={()=> TypeChange("Hospital")}>Hospital</button>
                    <button className='t-S' onClick={()=> TypeChange("Shelter")}>Shelter</button>
                    <button className='t- active-btn' onClick={()=> TypeChange("")}>Clear</button>
                </div>
            </div>
        </div>

        
            <form className="update-med" style={{ display : updateMed?"block": "none"}}>
            <input type="text" placeholder="Enter Medical Center ID" readOnly value={updateID} />
            <input type="text" placeholder="Enter Medical Center Name" ref={CName} />
            <input type="text" placeholder="Enter Medical Center Address" ref={CAddress} />
            <input type="text" placeholder="Enter Medical Center Hotline" ref={CHotline} />
            <input type="text" placeholder="Enter Medical Center Email" ref={CEmail} />
            <input type="text" placeholder="Enter Medical Center Rating" ref={CRating} />
            <input type="text" placeholder="Enter Medical Center Type" ref={CType} />
            <input type="number" placeholder="Enter Medical Center Seats" ref={CSeats} />
            <button type='button' onClick={()=>{
                setUpdateMed(false);
            }} >Cancel</button>
            <button type='button' onClick={()=> updateMedical(updateID)}>Update</button>
        </form>
        

        <table style={{
          display: 'table'
        }} className='med-table'>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Hotline</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Type</th>
                <th>Seats</th>
                {
                    isAdmin? <><th>Update</th> <th>Delete</th></> : ""
                }
            </tr>
            { 
                MedicalCenters && MedicalCenters.map((meds)=>(
                    <tr >
                        <td>{meds.ID}</td>
                        <td onClick={()=> linkMedical(meds.ID)} style={{ cursor : 'pointer'}}>{meds.Name}</td>
                        <td>{meds.Address}</td>
                        <td>{meds.Hotline}</td>
                        <td>{meds.Email}</td>
                        <td>{meds.Rating}</td>
                        <td>{meds.Type}</td>
                        <td>{meds.Seats}</td>
                        {
                            isAdmin? <>
                                <td><button onClick={()=>{
                                    setUpdateMed(true);
                                    
                                    updateForm(meds.ID);
                                }}> 
                                    update </button></td> 
                                <td><button> 
                                    Delete </button></td> 
                                </>: ""
                        }
                    </tr>
                ))
            }

        </table>
    </>
  )
}
