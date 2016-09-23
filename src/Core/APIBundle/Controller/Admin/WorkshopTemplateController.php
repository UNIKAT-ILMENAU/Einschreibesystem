<?php
/**
 * Created by IntelliJ IDEA.
 * Authors: Marco Harnisch,Martin Griebel, Leon Bergmann
 * Date: 29.04.2016
 * Time: 16:44
 */
namespace Core\APIBundle\Controller\Admin;

use Core\EntityBundle\Entity\WorkshopTemplates;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Util\Codes;
use JMS\Serializer\SerializationContext;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use Doctrine\ORM\Query;

/**
 * Class RestController.
 * The WorkshopTemplateController provides functions to get a list of Templates, to get a Template, to patch, create and delete a Template of a workshop.
 * @Rest\RouteResource("Template")
 */
class WorkshopTemplateController extends FOSRestController implements ClassResourceInterface
{
    /**
     * Returns list of all workshoptemplates
     * @ApiDoc(
     *  resource=true,
     *  description="Returns list of all templates",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     * @return \Symfony\Component\HttpFoundation\Response
     * @return array give the list of all workshoptemplates
     * @var WorkshopTemplates $workshopTemplates
     * @Rest\View()
     */
    public function getListAction()
    {
        $workshopTemplates = $this->getDoctrine()->getManager()->getRepository(
            'CoreEntityBundle:WorkshopTemplates'
        )->findAll();
        if (!$workshopTemplates) {
            return $this->handleView($this->view(['code' => 404, 'message' => "No workshop template found"], 404));
        }

        $view = $this->view($workshopTemplates, 200);
        return $this->handleView($view);
    }

    /**
     * laod a workshoptemplate
     * @ApiDoc(
     *  resource=true,
     *  description="Load a template",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Workshoptemplate ID"
     *      }
     *    }
     * )
     *
     * @param                 $id int Id of the Workshop Template
     *
     * @return action to load a template
     * @var WorkshopTemplates $workshopTemplate
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getAction($id)
    {
        $workshopTemplate = $this->getDoctrine()->getManager()->getRepository(
            'CoreEntityBundle:WorkshopTemplates'
        )->find($id);
        if (!$workshopTemplate) {
            return $this->handleView($this->view(['code' => 404, 'message' => "This workshop template found"], 404));
        } else {
            $view = $this->view($workshopTemplate, 200);
            return $this->handleView($view);
        }
    }

    /**
     * edit a workshoptemplate
     * @ApiDoc(
     *  resource=true,
     *  description="Edit a template",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="WorkshopTemplate ID"
     *      }
     *  },requirements={
     *      {
     *          "name"="title",
     *          "dataType"="string",
     *          "requirement"="\w+",
     *          "description"="title of the workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="description",
     *          "dataType"="string",
     *          "requirement"="\w+",
     *          "description"="description of the workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="cost",
     *          "dataType"="float",
     *          "requirement"="[0-9\.]+",
     *          "description"="cost of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="requirements",
     *          "dataType"="string",
     *          "requirement"="\w+",
     *          "description"="requirements of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="location",
     *          "dataType"="string",
     *          "requirement"="\w+",
     *          "description"="location of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="start_at",
     *          "dataType"="DateTime",
     *          "requirement"=".*",
     *          "description"="starttime of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="end_at",
     *          "dataType"="DateTime",
     *          "requirement"="",
     *          "description"="endtime of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="max_participants",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="maximum number of participants"
     *      }
     *   }
     * )
     *
     * @param                $paramFetcher ParamFetcher
     * @param                $id int id of the workshop template
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @REST\RequestParam(name="title", requirements=".*", description="title of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="description", requirements=".*", description="description of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="cost", requirements=".*", description="cost of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="requirements", requirements=".*", description="requirements of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="location", requirements=".*", description="location of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="start_at", requirements=".*", description="starttime of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="end_at", requirements=".*", description="endtime of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="max_participants", requirements=".*", description="maximum number of participants",default=null,nullable=true)
     *
     * @param string         $title title of the workshop
     * @param string         $description description of the workshop
     * @param float          $cost cost of the workshop
     * @param string         $requirements requirements of the workshop
     * @param string         $location location of the workshop
     * @param DateTime       $start_at starttime of the workshop
     * @param DateTime       $end_at endtime of the workshop
     * @param integer        $max_participants maximum number of participants
     *
     * @var WorkshopTemplate $workshopTemplate
     * @Rest\View()
     */
    public function patchAction(ParamFetcher $paramFetcher, $id)
    {

        /* load all parameters */
        $params = $paramFetcher->all();
        /* load the workshopTemplate from the database*/
        $workshopTemplate = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:WorkshopTemplates"
        )->find($id);
        /* check if the workshopTemplate exist */
        if (!$workshopTemplate) {
            return $this->handleView($this->view(['code' => 404, 'message' => "No workshop tempalte found"], 404));

        }
        /* check the parameters */
        if ($params["title"] != null) {
            $workshopTemplate->setTitle($params["title"]);
        }
        if ($params["description"] != null) {
            $workshopTemplate->setDescription($params["description"]);
        }
        if ($params["cost"] != null) {
            $workshopTemplate->setCost($params["cost"]);
        }
        if ($params["requirements"] != null) {
            $workshopTemplate->setRequirements($params["requirements"]);
        }
        if ($params["location"] != null) {
            $workshopTemplate->setLocation($params["location"]);
        }
        if ($params["start_at"] != null) {
            $workshopTemplate->setStartAt(\DateTime::createFromFormat('Y-m-d H:i:s', $params["start_at"]));
        }
        if ($params["end_at"] != null) {
            $workshopTemplate->setEndAt(\DateTime::createFromFormat('Y-m-d H:i:s', $params["end_at"]));
        }
        if ($params["max_participants"] != null) {
            $workshopTemplate->setMaxParticipants($params["max_participants"]);
        }
        /* save the edited template to the database*/
        $this->getDoctrine()->getManager()->persist($workshopTemplate);
        $this->getDoctrine()->getManager()->flush();
        /* return empty view with http ok*/
        return View::create(null, Codes::HTTP_OK);
    }

    /**
     * create a new workshoptemplate
     * @ApiDoc(
     *  resource=true,
     *  description="Create new template",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="title",
     *          "dataType"="string",
     *          "requirement"="\w+",
     *          "description"="title of the workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="description",
     *          "dataType"="string",
     *          "requirement"="\w+",
     *          "description"="description of the workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="cost",
     *          "dataType"="float",
     *          "requirement"="[0-9\.]+",
     *          "description"="cost of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="requirements",
     *          "dataType"="string",
     *          "requirement"="\w+",
     *          "description"="requirements of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="location",
     *          "dataType"="string",
     *          "requirement"="\w+",
     *          "description"="location of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="start_at",
     *          "dataType"="date",
     *          "requirement"=".*",
     *          "description"="starttime of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="end_at",
     *          "dataType"="date",
     *          "requirement"=".*",
     *          "description"="endtime of the Workshop"
     *      }
     *  },requirements={
     *      {
     *          "name"="max_participants",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="maximum number of participants"
     *      }
     *  }
     * )
     *
     * @param $paramFetcher ParamFetcher
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @REST\RequestParam(name="title", requirements=".*", description="title of the Workshop",nullable=true)
     * @REST\RequestParam(name="description", requirements=".*", description="description of the Workshop",nullable=true)
     * @REST\RequestParam(name="cost", requirements=".*", description="cost of the Workshop",nullable=true)
     * @REST\RequestParam(name="requirements", requirements=".*", description="requirements of the Workshop",nullable=true)
     * @REST\RequestParam(name="location", requirements=".*", description="location of the Workshop",nullable=true)
     * @REST\RequestParam(name="start_at", requirements=".*", description="starttime of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="end_at", requirements=".*", description="endtime of the Workshop",default=null,nullable=true)
     * @REST\RequestParam(name="max_participants", requirements="\d+", description="maximum number of participants",nullable=true)
     * @Rest\View()
     */
    public function putAction(ParamFetcher $paramFetcher)
    {
        $workshopTemplate = new WorkshopTemplates();
        $params = $paramFetcher->all();
        if ($params["title"] != null) {
            $workshopTemplate->setTitle($params["title"]);
        }
        if ($params["description"] != null) {
            $workshopTemplate->setDescription($params["description"]);
        }
        if ($params["cost"] != null) {
            $workshopTemplate->setCost($params["cost"]);
        }
        if ($params["requirements"] != null) {
            $workshopTemplate->setRequirements($params["requirements"]);
        }
        if ($params["location"] != null) {
            $workshopTemplate->setLocation($params["location"]);
        }
        if ($params["start_at"] != null) {
            $workshopTemplate->setStartAt(\DateTime::createFromFormat('Y-m-d H:i:s', $params["start_at"]));
        }
        if ($params["end_at"] != null) {
            $workshopTemplate->setEndAt(\DateTime::createFromFormat('Y-m-d H:i:s', $params["end_at"]));
        }
        if ($params["max_participants"] != null) {
            $workshopTemplate->setMaxParticipants($params["max_participants"]);
        }
        $this->getDoctrine()->getManager()->persist($workshopTemplate);
        $this->getDoctrine()->getManager()->flush();
        $view = $this->view($workshopTemplate, 200);
        return $this->handleView($view);
    }

    /**
     * delete a workshoptemplate
     * @ApiDoc(
     *  resource=true,
     *  description="Delete a template",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Workshoptemplate ID"
     *      }
     * }
     * )
     *
     * @param                $id int id of the workshop template
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @var workshopTemplate $workshopTemplate
     * @Rest\View()
     */
    public function deleteAction($id)
    {
        $workshopTemplate = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:WorkshopTemplates"
        )->find($id);
        if (!$workshopTemplate) {
            return $this->handleView($this->view(['code' => 404, 'message' => "Workshop template not found"], 404));
        }
        $this->getDoctrine()->getManager()->remove($workshopTemplate);
        $this->getDoctrine()->getManager()->flush();
        return View::create(null, Codes::HTTP_OK);
    }
}
