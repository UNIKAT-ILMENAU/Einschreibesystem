<?php
/**
 * Created by IntelliJ IDEA.
 * User: Marco Hanisch
 * Authors: Marco Hanisch 
 * Date: 31.05.2016
 * Time: 13:01
 */
namespace Core\APIBundle\Controller\Admin;

use Core\EntityBundle\Entity\Invitation;
use FOS\RestBundle\Request\ParamFetcher;

/**
 * Class RestController.
 */
 
 class AdminController extends FOSRestController implements ClassResourceInterface
{	
    /**
     * @ApiDoc(
     *  resource=true,
     *  description="Action to create new Admin",
     *  output = "Core\EntityBundle\Entity\Admin",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     *
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\RequestParam(name="email", requirements=".*", description="js object of workshop")
     * @Rest\View()
     */  
     public function inviteAdminAction($email) //kein Param
     {
         /**
          * When sending invitation set this value to 'true'
          *
          * It prevents sending invitations twice
          *
          * protected $sent =false;
          *
          * neue Invitation erstellen
          *Email versenden mit Link
          *
          *nächste Funktion: Invite Code überprüfen, falls stimmt, neuen User anlegen und auf enabled setzen
          *
          *Funktion Passwort ändern
          *
          */
         $invitation = new Invitation();
         //Create Token
         $code = $invitation->getCode();
         //$email = $paramFetcher->get("email"); //not needed anymore
         /* Loading the default E-Mail template*/
         $template = $this->getDoctrine()->getRepository("CoreEntityBundle:EmailTemplate")->find(1);
         /* Creating Twig template from Database */
         $renderTemplate = $this->get('twig')->createTemplate($template->getEmailBody());
         /* Sending E-Mail */
         $message = \Swift_Message::newInstance()
             ->setSubject($template->getEmailSubject())
             ->setFrom('send@example.com') //unsure which email!
             ->setTo($email)
             ->setBody($renderTemplate->render(["code" => $code,"email" => $email]),'text/html');
         $this->get('mailer')->send($message);
         $invitation->send(); //prevents sending invitations twice
         $this->getDoctrine()->getManager()->persist($invitation);
         $this->getDoctrine()->getManager()->flush();
     }
     /**
      * @ApiDoc(
      *  resource=true,
      *  description="Action to create an Admin",
      *  output = "Core\EntityBundle\Entity\Admin",
      *  statusCodes = {
      *      200 = "Returned when successful",
      *      404 = "Returned when the data is not found"
      *  },requirements={
      *        "name"="adminId",
      *        "dataType"="integer",
      *        "requirement"="\d+",
      *        "description"="Admin ID"
     }
      * )
      *
      * @return \Symfony\Component\HttpFoundation\Response
      * @Rest\RequestParam(name="email", requirements=".*", description="json object of workshop")
      * @Rest\RequestParam(name="password", requirements=".*", description="json object of workshop")
      * @Rest\RequestParam(name="code", requirements=".*", description="json object of workshop")
      * @Rest\View()
      */
     
     public function createAdmin(ParamFetcher $paramFetcher) //Param Email Passwort Token
     {
         //$params is array with E-Mail Password and Token (Code)
         $params = $paramFetcher->all();
         //find invitation in database
         $invitation = $this->getDoctrine()->getManager()->getRepository("invitation")->find();
         //check if invitation parameter sended is true
         if ($invitation->isSend() && $params["code"] == $invitation->getcode()){
             //FOSUserBundle
             $UserManager = ->get('fos_user.user_manager');
             //$usermanager = $this->getContainer()->get('fos_user.util.user_manipulator');
             //$admin = $userManager->createUser();
             //$admin->create($params);

             $UserManager = $this->get('fos_user.user_manager');
             
             $admin->setName($params['email']);
             
             //...?
             
         } else {
             throw $this->createAccessDeniedException("No invitation was sended!");
         }
     }
     
     

     	/**
     * @ApiDoc(
     *  resource=true,
     *  description="Action to disable an Admin",
     *  output = "Core\EntityBundle\Entity\Admin",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
              "name"="adminId",
     *        "dataType"="integer",
     *        "requirement"="\d+",
     *        "description"="Admin ID"
     }
     * )
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
     public function deleteAction ($adminID) //ParamFetcher?
     {
         /**
          * ToDo: - find Admin in Database
          *       - setEnabled function -> false
          */
         $admin = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle')->findby($adminID)
         $UserManager = $this->get('fos_user.user_manager'); //Object vom Typ FOSUserManager
         if(!$admin){
            throw $this->createNotFoundException("Admin not found");
         } else {
             $admin->setEnabled(false);
         }

     }
     	/**
     * @ApiDoc(
     *  resource=true,
     *  description="Action to change the password",
     *  output = "Core\EntityBundle\Entity\Admin",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
              "name"="adminId",
     *        "dataType"="integer",
     *        "requirement"="\d+",
     *        "description"="Admin ID"
     }
     * )
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\RequestParam(name="oldpassword", requirements=".*", description="json object of workshop")
     * @Rest\RequestParam(name="newpassword", requirements=".*", description="json object of workshop")
     * @Rest\View()
     */
     public function patchAction (ParamFetcher $paramfetcher)
     {
        /**
         * To do: - find Admin in Database
         *       - delete Password
         *       - setPasswort ?
         */
         $params = $paramfetcher->all();
         $admin = $this->getUser();
         $encoder_service = $this->get('security.encoder_factory');
         $encoder = $encoder_service->getEncoder($admin);
         if($encoder->isPasswordValid($admin->getPassword(), $params['oldpassword'], $admin->getSalt())){
            $admin->setPlainPassword($params['newpassword']);
         } else {
             throw $this->createAccessDeniedException("The old password is incorrect");
         }

     }

    //Passwort ändern
     
     
     
     }
