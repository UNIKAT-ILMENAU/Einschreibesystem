<?php
/**
 * Created by IntelliJ IDEA.
 * Authors: Leon Bergmann, Martin Griebel, Andreas Ifland, Marco Hanisch
 * Date: 29.04.2016
 * Time: 16:44
 */
namespace Core\APIBundle\Controller;

use Core\EntityBundle\Entity\Participants;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Util\Codes;
use JMS\Serializer\SerializationContext;
use Core\EntityBundle\Entity\Workshop;
use Core\EntityBundle\Entity\WorkshopParticipants;
use Core\EntityBundle\Entity\EmailToken;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Routing\ClassResourceInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use Symfony\Component\HttpFoundation\Request;
/**
 * Class RestController.
 * This Controller provides the methods for the public part of the website.
 * @Rest\RouteResource("Workshops")
 */

class WorkshopController extends FOSRestController implements ClassResourceInterface
{
    /**
     * Returns list of all Workshops that are active
     * @ApiDoc(
     *  resource=true,
     *  description="Returns list of all Workshops that are active",
     *  output = "Core\EntityBundle\Entity\Workshop",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getAllAction()
    {
        $workshopRepo = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle:Workshop');
        $workshops = $workshopRepo->getAllActiveWorkshops();
        if (!$workshops) {
            throw $this->createNotFoundException("No Workshops found");
        }
        $view = $this->view($workshops, 200);
        return $this->handleView($view);
    }
    
    /**
     * Returns Details of a Workshop
     * @ApiDoc(
     *  resource=true,
     *  description="Returns Details of a Workshop",
     *  output = "Core\EntityBundle\Entity\Workshop",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="which workshop to display"
     *      }
     *  }
     * )
     * @param $id id of a workshop
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getAction($id)
    {
        $workshop = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle:Workshop')->find($id);
        if (!$workshop) {
            throw $this->createNotFoundException("This workshop was not found");
        } else {
            $view = $this->view($workshop, 200);
            return $this->handleView($view);
        }
    }

    /**
     * Action to enroll on a Workshop.
     * @ApiDoc(
     *  resource=true,
     *  description="Action to enroll on a Workshop",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\RequestParam(name="name", requirements=".*", description="json object of workshop")
     * @Rest\RequestParam(name="surname", requirements=".*", description="json object of workshop")
     * @Rest\RequestParam(name="email", requirements=".*", description="json object of workshop")
     * @param $id int id of the workshop the user wants to enroll
     * @param $paramFetcher ParamFetcher Helper to get the params from the post request
     * @Rest\View()
     */
    public function postEnrollAction($id, ParamFetcher $paramFetcher)
    {
        $params = $paramFetcher->all();

        $workshop = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Workshop")->find($id);
        $participant = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Participants")->findOneBy(["email" => $params["email"]]);
        
        if (!$workshop) {
            throw $this->createNotFoundException("Workshop not found");
        }

        if ($participant == NULL){
            $participant = new Participants();
            $participant->setBlacklisted(false);
            $participant->setEmail($params["email"]);
            $participant->setName($params["name"]);
            $participant->setSurname($params["surname"]);


            $this->getDoctrine()->getManager()->persist($participant);
            $this->getDoctrine()->getManager()->flush();

        } else {
            //all workshops which the user were not participating yet
            if ($participant->isBlacklisted()) {
                throw $this->createAccessDeniedException("You are blacklisted");
            }

            $workshopParticipants = $this->getDoctrine()->getRepository("CoreEntityBundle:WorkshopParticipants")->findBy(["participant" => $participant, "participated" => 0]);
            //load workshop with start and endtim, iterate over all

            foreach($workshopParticipants as $tupel){
                $tempWorkshop = $this->getDoctrine()->getRepository("Workshop")->find($tupel->getId());
                if($workshop->getStartAt() >= $tempWorkshop->getStartAt() && $workshop->getEndAt() <= $tempWorkshop->getEndAt()){
                    throw $this->createAccessDeniedException("Already in Workshop at same Time");
                }
            }
        }

        $token = new EmailToken();
        $token->setParticipant($participant);
        $this->getDoctrine()->getManager()->persist($token);
        $this->getDoctrine()->getManager()->flush();
        
        $url = $this->generateUrl('core_frontend_default_index',[],TRUE)."#/enrollment/confirm/".$workshop->getId()."/".$participant->getId()."/".$token->getToken();


        //load Template for confirment
        $template = $this->getDoctrine()->getRepository("CoreEntityBundle:EmailTemplate")->find(2);
        /* Creating Twig template from Database */
        $renderTemplate = $this->get('twig')->createTemplate($template->getEmailBody());
        /* Sending E-Mail with Confirmation Link*/
        $message = \Swift_Message::newInstance()
            ->setSubject($this->get('twig')->createTemplate($template->getEmailSubject())->render(["workshop" => $workshop]))
            ->setFrom($this->getParameter('email_sender'))
            ->setTo($participant->getEmail())
            ->setBody($renderTemplate->render(["workshop" => $workshop,"participant" => $participant,'url' => $url]),'text/html');
        $this->get('mailer')->send($message);

        return View::create(NULL, Codes::HTTP_OK);
    }

    /**
     * Action to confirm enrollment on a workshop
     * @ApiDoc(
     *  resource=true,
     *  description="Action to confirm enrollment on a workshop",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @param  $workshopId int id of the workshop
     * @param  $participantsId int id of the participant
     * @param  $token string token to identify the participant
     * @Rest\View()
     */
    public function getEnrollConfirmAction($workshopId,$participantsId,$token)
    {
        $workshop = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Workshop")->find($workshopId);
        $token = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:EmailToken")->findOneBy(['token' => $token]);
        $participant = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Participants")->find($participantsId);

        // Workshop & Token & participant are valid
        if($workshop != NULL  && $token != NULL && $participant != NULL){
            // Check if Token is not older then 30 min
            if($token->getValidUntil() <= new \DateTime('now')){
                // Check if this token is dedicated to user
                if($token->getParticipant() != $participant){
                    throw $this->createAccessDeniedException("User does not match");
                }else{
                    $participantWorkshop = new WorkshopParticipants();
                    $participantWorkshop->setWorkshop($workshop);
                    $participantWorkshop->setParticipant($participant);
                    $participantWorkshop->setEnrollment(new \DateTime('now'));
                    $participantWorkshop->setParticipated(false);
                    // Get Participants
                    $participants = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Workshop")->getParticipants($workshopId);
                    // Check if a waitinglist ist requiered
                    if($participants > $workshop->getMaxParticipants())
                        $participantWorkshop->setWaiting(true);
                    else
                        $participantWorkshop->setWaiting(false);
                    $token->setUsedAt(new \DateTime('now'));
                    // save to database
                    $this->getDoctrine()->getManager()->persist($token);
                    $this->getDoctrine()->getManager()->persist($participantWorkshop);
                    $this->getDoctrine()->getManager()->flush();
                    return View::create(null, Codes::HTTP_ACCEPTED);
                }
            }else{
                throw $this->createAccessDeniedException("Token ist not valid");
            }
        }else{
            throw $this->createNotFoundException("Workshop or Token not found");
        }
    }

    /**
     * action to unsubscribe a workshop
     * @ApiDoc(
     *  resource=true,
     *  description="Action to unsubscribe a Workshop",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     * @param $id int id of the workshop
     * @param $token string token to identify the user
     * @param $participantsID int id of the participant
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getUnsubscribeAction($id,$token, $participantsID)
    {
        $workshop = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Workshop")->find($id);
        /*@var $token Core\EntityBundle\Entity\EmailToken */
        $token = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:EmailToken")->findOneBy(['token' => $token]);
        $participant = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Participants")->find($participantsID);

        $workshopParticipant = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:WorkshopParticipants")->findById($id, $participantsID);

        if ($workshop != NULL && $token != NULL && $participant != NULL) {
            if ($token->getValidUntil() <= new \DateTime('now')) {
                if ($token->getParticipant() != $participant) {
                    throw $this->createAccessDeniedException("User does not match");
                } else {
                    $workshopParticipant->setWorkshop($id);
                    $workshopParticipant->setParticipant($participant);

                    $token->setUsedAt(new \DateTime('now'));
                    $this->getDoctrine()->getManager()->persist($token);
                    $this->getDoctrine()->getManager()->remove($workshopParticipant);
                    $this->getDoctrine()->getManager()->flush();
                }
            } else {
                throw $this->createAccessDeniedException("Token ist not valid");
            }
        } else {
            return $this->handleView($this->view(['code' => 404,'message' => "Workshop or Token not found"], 404));
        }
    }

    /**
     * Returns the waiting list of a workshop
     * @ApiDoc(
     *  resource=true,
     *  description="Returns the waiting list of a workshop",
     *  output = {
     *      "class"="Core\EntityBundle\Entity\WorkshopParticipants",
     *      "groups"={"names"}
     *  },statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Workshop ID"
     *      }
     *  }
     * )
     * @param $id int id of workshop
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getWaitinglistAction($id)
    {
        $waitingList = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle:WorkshopParticipants')->findBy(['workshop' => $id,'waiting' => 1],['enrollment' => "DESC"]);
        if (!$waitingList) {
            return $this->handleView($this->view(['code' => 404,'message' => "No waitinglist for workshop"], 404));
        }

        $waiting = [];
        foreach ($waitingList as $participant) {
            $waiting[] = [
                'name' => $participant->getParticipant()->getName(),
                'surname' => $participant->getParticipant()->getSurname()
            ];
        }

        $view = $this->view($waiting, 200);
        return $this->handleView($view);
    }
    /**
     * Returns the list of participants
     * @ApiDoc(
     *  resource=true,
     *  description="Returns the list of participants",
     *  output = "Core\EntityBundle\Entity\WorkshopParticipants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Workshop ID"
     *      }
     *  }
     * )
     * @param $id int id of workshop
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
     public function getParticipantsAction($id)
    {  
	    $participantsList = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle:WorkshopParticipants')->findBy(['workshop' => $id],['enrollment' => "DESC"]);
	    if (!$participantsList) {
            return $this->handleView($this->view(['code' => 404,'message' => "No Participant in Workshop found"], 404));
         }
        $participants = [];
        foreach($participantsList as $participant){
            $participants[] = ['name' =>$participant->getParticipant()->getName(),'surname' => $participant->getParticipant()->getSurname()];
        }

        $view = $this->view($participants, 200);
        return $this->handleView($view);
    }
}
