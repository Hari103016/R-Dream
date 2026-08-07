import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import { supabase } from "../services/supabase";

import "./BookPlotModal.css";


function BookPlotModal({
    plot,
    selectedPlots = [],
    onClose
}) {


    const bookingPlots =
        selectedPlots.length > 0
        ? selectedPlots
        : plot
        ? [plot]
        : [];



    const [customer,setCustomer] = useState({

        name:"",
        mobile:"",
        advance:"",
        payment_mode:"Cash"

    });



    const [loading,setLoading] = useState(false);



    const totalAmount = useMemo(()=>{


        return bookingPlots.reduce(

            (sum,item)=>

            sum + Number(item.price || 0),

            0

        );


    },[bookingPlots]);




    const advance =
    Number(customer.advance || 0);



    const balance =
    Math.max(
        totalAmount - advance,
        0
    );




    const plotNumbers =
    bookingPlots
    .map(
        item=>item.plot_no
    )
    .join(",");



    const plotSizes =
    bookingPlots
    .map(
        item=>`${item.plot_size} Sq.Yds`
    )
    .join(",");





    function handleChange(e){


        const {
            name,
            value
        } = e.target;



        setCustomer(prev=>({

            ...prev,

            [name]:

            name==="advance"

            ?

            value.replace(/[^0-9]/g,"")

            :

            value

        }));

    }





    async function bookPlot(){


        if(loading)
            return;



        if(!customer.name.trim()){

            toast.error("Enter Customer Name");
            return;

        }



        if(!customer.mobile.trim()){

            toast.error("Enter Mobile Number");
            return;

        }



        if(advance > totalAmount){

            toast.error(
                "Advance cannot be greater than total amount"
            );

            return;

        }



        setLoading(true);



        try{


            // CHECK AVAILABILITY

            const {
                data:plotCheck,
                error:checkError

            } = await supabase

            .from("plots")

            .select("id,status")

            .in(

                "id",

                bookingPlots.map(
                    p=>p.id
                )

            );



            if(checkError)
                throw checkError;



            const alreadyBooked =
            plotCheck.some(

                p=>

                p.status==="Booked" ||

                p.status==="Sold"

            );



            if(alreadyBooked){


                Swal.fire({

                    title:"Plot Not Available",

                    text:
                    "Selected plot already booked or sold",

                    icon:"warning"

                });


                setLoading(false);

                return;

            }





            // CREATE CUSTOMER


            const {

                data:customerData,

                error:customerError


            } = await supabase

            .from("customers")

            .insert([{


                name:
                customer.name,


                mobile:
                customer.mobile,


                plot_no:
                plotNumbers,


                plot_size:
                plotSizes,


                facing:

                bookingPlots

                .map(
                    p=>p.facing
                )

                .join(","),



                total_amount:
                totalAmount,


                amount_paid:
                advance,


                balance:
                balance,


                booking_date:
                new Date()
                .toISOString(),



                status:

                balance===0

                ?

                "Sold"

                :

                "Booked"



            }])

            .select()

            .single();





            if(customerError)
                throw customerError;




            const customerId =
            customerData.id;





            // SAVE PAYMENT


            if(advance > 0){


                const {

                    error:paymentError

                } = await supabase

                .from("payments")

                .insert([{


                    customer_id:
                    customerId,


                    amount:
                    advance,


                    payment_mode:
                    customer.payment_mode,


                    remarks:
                    "Booking Advance",


                    payment_date:
                    new Date()
                    .toISOString()


                }]);



                if(paymentError)
                    throw paymentError;


            }





            // UPDATE PLOT STATUS


            const newStatus =

            balance===0

            ?

            "Sold"

            :

            "Booked";




            const {

                error:updateError


            } = await supabase

            .from("plots")

            .update({

                status:newStatus,

                customer_id:customerId

            })

            .in(

                "id",

                bookingPlots.map(
                    p=>p.id
                )

            );





            if(updateError)
                throw updateError;





            Swal.fire({

                title:"Booking Successful!",

                text:
                "Plot booked successfully",

                icon:"success",

                confirmButtonColor:"#10b981"

            });



            onClose();



        }

        catch(error){


            console.log(error);


            toast.error(

                error.message ||

                "Booking Failed"

            );


        }


        finally{


            setLoading(false);


        }


    }





    return (

        <div className="modal-overlay">


            <div className="modal">


                <div className="modal-header">


                    <h2>

                    {
                        bookingPlots.length > 1

                        ?

                        "Book Multiple Plots"

                        :

                        `Book Plot #${bookingPlots[0]?.plot_no}`

                    }

                    </h2>



                    <button
                    type="button"
                    onClick={onClose}
                    >

                        <X size={20}/>

                    </button>


                </div>





                <div className="form-grid">



                    <div className="form-group">

                        <label>
                            Customer Name *
                        </label>


                        <input

                        name="name"

                        value={customer.name}

                        onChange={handleChange}

                        placeholder="Enter Customer Name"

                        />


                    </div>





                    <div className="form-group">

                        <label>
                            Mobile Number *
                        </label>


                        <input

                        name="mobile"

                        value={customer.mobile}

                        onChange={handleChange}

                        placeholder="Enter Mobile Number"

                        />


                    </div>





                    <div className="form-group">

                        <label>
                            Plot Numbers
                        </label>


                        <input

                        value={plotNumbers}

                        readOnly

                        />

                    </div>





                    <div className="form-group">

                        <label>
                            Total Plots
                        </label>


                        <input

                        value={bookingPlots.length}

                        readOnly

                        />

                    </div>





                    <div className="form-group">

                        <label>
                            Plot Sizes
                        </label>


                        <textarea

                        value={plotSizes}

                        readOnly

                        />

                    </div>





                    <div className="form-group">

                        <label>
                            Payment Mode
                        </label>


                        <select

                        name="payment_mode"

                        value={customer.payment_mode}

                        onChange={handleChange}

                        >

                            <option>
                                Cash
                            </option>

                            <option>
                                UPI
                            </option>

                            <option>
                                Bank Transfer
                            </option>

                            <option>
                                Cheque
                            </option>


                        </select>


                    </div>





                    <div className="form-group">

                        <label>
                            Advance Amount
                        </label>


                        <input

                        name="advance"

                        value={customer.advance}

                        onChange={handleChange}

                        placeholder="Enter Advance"

                        />


                    </div>





                    <div className="form-group">

                        <label>
                            Total Amount
                        </label>


                        <input

                        value={
                            `Rs. ${totalAmount.toLocaleString("en-IN")}`
                        }

                        readOnly

                        />


                    </div>





                    <div className="form-group">

                        <label>
                            Balance Amount
                        </label>


                        <input

                        value={
                            `Rs. ${balance.toLocaleString("en-IN")}`
                        }

                        readOnly

                        />


                    </div>



                </div>





                <div className="modal-actions">



                    <button

                    type="button"

                    className="cancel-btn"

                    onClick={onClose}

                    disabled={loading}

                    >

                        Cancel

                    </button>





                    <button

                    type="button"

                    className="save-btn"

                    onClick={bookPlot}

                    disabled={loading}

                    >

                    {
                        loading
                        ?
                        "Booking..."
                        :
                        "Book Plot"
                    }


                    </button>



                </div>



            </div>


        </div>

    );


}


export default BookPlotModal;